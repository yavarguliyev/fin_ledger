#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🚀 Starting development environment..."

if [ "${1:-}" = "client" ]; then
  echo "Starting Angular client only..."
  npm run dev:client
elif [ "${1:-}" = "api" ]; then
  echo "Starting API only..."
  npx turbo run build --filter=apps/core-api^...
  npx turbo run dev --filter=apps/core-api --no-cache
else
  echo "Starting both API and client..."
  # Build dependencies first
  npx turbo run build --filter=apps/core-api^...
  
  # Start both services concurrently
  npm run dev
fi