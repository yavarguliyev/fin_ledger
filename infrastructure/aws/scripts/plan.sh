#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

print_header "Planning infrastructure changes"
require_prerequisites

compose up -d --wait localstack
terraform_run init -input=false
terraform_run plan -input=false -var-file="${TFVARS_FILE}"
