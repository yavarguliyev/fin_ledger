#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

LOCALSTACK_URL="http://localhost:4566"
CLIENT_DIR="${REPO_ROOT}/apps/client"
BUILD_DIR="${CLIENT_DIR}/dist/demo/browser"

print_header "Deploying the Angular client to the S3 website"
require_prerequisites

BUCKET="$(terraform_run output -raw web_bucket)"
API_ID="$(terraform_run output -raw public_rest_api_id)"
API_URL="http://${API_ID}.execute-api.localhost.localstack.cloud:4566/v1/api/v1"

print_step "Building the client"
(cd "${REPO_ROOT}" && npm run build:client > /dev/null)

print_step "Pointing the client at the API Gateway"
API_URL="${API_URL}" node "${CLIENT_DIR}/scripts/write-runtime-config.js" "${BUILD_DIR}"

print_step "Uploading the build"
node "${AWS_DIR}/scripts/web-upload.mjs" "${BUILD_DIR}" "${BUCKET}" "${LOCALSTACK_URL}" "${REPO_ROOT}"

print_success "Client live at http://${BUCKET}.s3-website.localhost.localstack.cloud:4566/ (API: ${API_URL})"
