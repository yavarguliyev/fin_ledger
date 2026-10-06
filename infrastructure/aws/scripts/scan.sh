#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

print_header "Scanning Terraform for security misconfigurations"
validate_docker_available || exit 1

docker run --rm \
  -v "${AWS_DIR}/terraform:/src:ro" \
  -v "${AWS_DIR}/trivyignore.yaml:/trivyignore.yaml:ro" \
  "${TRIVY_IMAGE}" config \
  --severity MEDIUM,HIGH,CRITICAL \
  --ignorefile /trivyignore.yaml \
  --exit-code 1 \
  /src

print_success "No medium, high or critical findings."
