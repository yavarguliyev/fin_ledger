#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

print_header "Starting LocalStack and applying Terraform"
require_prerequisites

print_step "Scanning Terraform for security issues"
bash "${AWS_DIR}/scripts/scan.sh"

print_step "Starting LocalStack"
compose up -d --wait localstack

print_step "Initialising Terraform"
terraform_run init -input=false

print_step "Applying infrastructure"
terraform_run apply -input=false -auto-approve -var-file="${TFVARS_FILE}"

if [ -f "${REPO_ROOT}/apps/core-api/.env.local" ]; then
  bash "${AWS_DIR}/scripts/secrets.sh"
fi

print_success "LocalStack is ready at http://localhost:4566"
terraform_run output
