#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

APP_ENV_LOCAL="${REPO_ROOT}/apps/core-api/.env.local"
APP_ENV_AWS="${REPO_ROOT}/apps/core-api/.env.aws"
KEYS_FILE="${AWS_DIR}/secrets/core-api.keys"

print_header "Loading application secrets into Secrets Manager"
require_prerequisites

if [ ! -f "${APP_ENV_LOCAL}" ]; then
  print_error "No ${APP_ENV_LOCAL}. Copy apps/core-api/.env.local.example first."
  exit 1
fi

SECRET_ID="$(terraform_run output -raw secret_name)"

node "${AWS_DIR}/scripts/secret-payload.mjs" "${KEYS_FILE}" "${REPO_ROOT}" "${APP_ENV_LOCAL}" "${APP_ENV_AWS}" |
  compose exec -T localstack awslocal secretsmanager put-secret-value \
    --secret-id "${SECRET_ID}" --secret-string file:///dev/stdin --query VersionId --output text >/dev/null

print_success "Secret ${SECRET_ID} updated. Values are never printed."
