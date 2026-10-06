#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

FORCE_MODE=false

for arg in "$@"; do
  case "$arg" in
    --force|-f)
      FORCE_MODE=true
      ;;
    --help|-h)
      echo "Usage: $0 [--force]"
      echo ""
      echo "Removes everything the local AWS stack left on this machine:"
      echo "  • the LocalStack and Terraform containers and the ddd_aws network"
      echo "  • the localstack_data volume (every emulated resource and secret value)"
      echo "  • the Terraform state and the downloaded provider cache"
      echo "  • the LocalStack, Terraform and Trivy images"
      echo ""
      echo "The Terraform code, .terraform.lock.hcl and your .env files are kept."
      echo "Run npm run aws:up afterwards to build everything again."
      exit 0
      ;;
    *)
      print_warn "Unknown option: $arg"
      ;;
  esac
done

print_header "Preparing complete local AWS removal"
validate_docker_available || exit 1
validate_docker_compose_available || exit 1

export LOCALSTACK_AUTH_TOKEN="${LOCALSTACK_AUTH_TOKEN:-not-needed-for-removal}"

remove_compose() {
  docker compose -f "${COMPOSE_FILE}" --project-name "${COMPOSE_PROJECT}" --profile tools "$@"
}

IMAGES=$( (remove_compose config --images 2>/dev/null; echo "${TRIVY_IMAGE}") | sort -u)

if [ "${FORCE_MODE}" != "true" ]; then
  print_warn "This permanently removes the local AWS stack:"
  print_warn "  • containers of project ${COMPOSE_PROJECT} and the ddd_aws network"
  print_warn "  • volumes: $(docker volume ls --filter "label=com.docker.compose.project=${COMPOSE_PROJECT}" --format '{{.Name}}' | tr '\n' ' ')"
  print_warn "  • ${STATE_DIR} and ${PROVIDER_CACHE_DIR}"
  print_warn "  • images: $(echo "${IMAGES}" | tr '\n' ' ')"
  print_warn "Type 'yes' to confirm:"
  read -r -p "  > " confirmation

  if [ "${confirmation}" != "yes" ]; then
    print_error "Operation cancelled. No changes were made."
    exit 0
  fi
fi

print_step "Stopping containers and deleting volumes and the network"
remove_compose down --volumes --remove-orphans --timeout 5 || print_warn "Compose reported warnings, continuing"

if docker ps -a --format '{{.Names}}' | grep -qx "${LOCALSTACK_CONTAINER}"; then
  print_step "Removing the leftover ${LOCALSTACK_CONTAINER} container"
  docker rm -f "${LOCALSTACK_CONTAINER}" > /dev/null
fi

print_step "Deleting the Terraform state and provider cache"
rm -rf "${STATE_DIR}" "${PROVIDER_CACHE_DIR}"

print_step "Removing images"
for image in ${IMAGES}; do
  if docker image inspect "${image}" > /dev/null 2>&1; then
    docker rmi -f "${image}" > /dev/null && print_info "Removed ${image}"
  fi
done

print_success "Local AWS stack removed. Run npm run aws:up to build it again."
