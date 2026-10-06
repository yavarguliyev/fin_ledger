#!/usr/bin/env bash
set -euo pipefail

AWS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${AWS_DIR}/../.." && pwd)"
COMPOSE_FILE="${AWS_DIR}/docker-compose.yml"
ROOT_ENV_FILE="${REPO_ROOT}/.env"
TFVARS_FILE="environments/local.tfvars"
STATE_DIR="${AWS_DIR}/terraform/.state"
PROVIDER_CACHE_DIR="${AWS_DIR}/terraform/.terraform"
COMPOSE_PROJECT="ddd-aws"
LOCALSTACK_CONTAINER="ddd_localstack"
TRIVY_IMAGE="aquasec/trivy:0.75.0"

source "${REPO_ROOT}/infrastructure/dev/lib-docker.sh"

compose() {
  docker compose --env-file "${ROOT_ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

terraform_run() {
  compose run --rm terraform "$@"
}

require_prerequisites() {
  validate_docker_available || exit 1
  validate_docker_compose_available || exit 1

  if [ ! -f "${ROOT_ENV_FILE}" ]; then
    print_error "No .env at the repository root. Copy .env.example to .env first."
    exit 1
  fi

  if ! grep -Eq '^LOCALSTACK_AUTH_TOKEN=.+' "${ROOT_ENV_FILE}"; then
    print_error "LOCALSTACK_AUTH_TOKEN is missing in ${ROOT_ENV_FILE}."
    print_error "Create a free account at https://app.localstack.cloud, copy your personal auth token and add it there."
    exit 1
  fi
}
