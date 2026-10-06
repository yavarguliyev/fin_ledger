#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

print_header "Stopping LocalStack"
require_prerequisites

compose down --volumes
rm -rf "${STATE_DIR}"

print_success "LocalStack stopped. Its resources are gone, so the next aws:up recreates them from Terraform."
