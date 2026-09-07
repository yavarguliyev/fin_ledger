#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# CONFIGURATION & STATIC SETTINGS
# ==============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="ddd"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_FILE="${SCRIPT_DIR}/.env"
LIB_SCRIPT="${SCRIPT_DIR}/lib-docker.sh"
STOP_SCRIPT="${SCRIPT_DIR}/stop.sh"
START_SCRIPT="${SCRIPT_DIR}/start.sh"

# Source the utility library
if [ ! -f "$LIB_SCRIPT" ]; then
  echo -e "${RED}[ERROR]   Utility library not found: $LIB_SCRIPT${NC}" >&2
  exit 1
fi
source "$LIB_SCRIPT"

# ==============================================================================
# PRE-FLIGHT CHECKS
# ==============================================================================
print_header "Preparing Infrastructure Restart Sequence"

# Validate Docker is available
if ! validate_docker_available; then
  exit 1
fi

if ! validate_docker_compose_available; then
  exit 1
fi

if ! validate_compose_file "$COMPOSE_FILE"; then
  exit 1
fi

# ==============================================================================
# PARSE COMMAND LINE ARGUMENTS
# ==============================================================================
CLEAN_MODE=false
AGGRESSIVE_CLEANUP=false

for arg in "$@"; do
  case "$arg" in
    --clean|-c)
      CLEAN_MODE=true
      print_info "Clean mode enabled: volumes will be wiped"
      ;;
    --aggressive)
      AGGRESSIVE_CLEANUP=true
      print_info "Aggressive cleanup enabled: unused images will be removed"
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --clean, -c       Wipe volumes during restart (clean slate)"
      echo "  --aggressive      Remove unused images during cleanup"
      echo "  --help, -h        Show this help message"
      exit 0
      ;;
    *)
      print_warn "Unknown option: $arg"
      ;;
  esac
done

# ==============================================================================
# GRACEFUL SHUTDOWN PHASE
# ==============================================================================
print_header "Phase 1: Graceful Shutdown"

STOP_ARGS=""
if [ "$CLEAN_MODE" = "true" ]; then
  STOP_ARGS="--clean"
fi

if [ -f "$STOP_SCRIPT" ]; then
  print_step "Invoking stop script with args: $STOP_ARGS..."
  
  if bash "$STOP_SCRIPT" $STOP_ARGS; then
    print_success "Graceful shutdown completed successfully"
  else
    print_error "Stop script encountered issues"
    exit 1
  fi
else
  print_error "Stop script not found at: $STOP_SCRIPT"
  exit 1
fi

# ==============================================================================
# SMART SANITIZATION ENGINE (Clears Host Clutter Safely)
# ==============================================================================
print_header "Phase 2: System Resource Cleanup"

print_step "Removing stopped containers..."
docker container prune -f 2>/dev/null || true

print_step "Cleaning up stale network interfaces..."
docker network prune -f 2>/dev/null || true

if [ "$AGGRESSIVE_CLEANUP" = "true" ]; then
  print_warn "Aggressive mode: removing dangling and untagged images..."
  docker image prune -f 2>/dev/null || true
  print_info "You can recover disk space with: docker system prune --all -f"
fi

print_step "Orphan volume detection and cleanup..."
docker volume prune -f 2>/dev/null || true

print_success "System resource cleanup completed"

# ==============================================================================
# COOLING DOWN PHASE
# ==============================================================================
print_header "Phase 3: System Stabilization"

print_info "Allowing system time for OS kernel socket/thread cleanup (3 seconds)..."
print_info "   This prevents port binding conflicts and ensures clean state..."
sleep 3

print_success "System stabilization complete"

# ==============================================================================
# RE-INITIALIZATION PHASE
# ==============================================================================
print_header "Phase 4: Infrastructure Re-initialization"

if [ -f "$START_SCRIPT" ]; then
  print_step "Booting infrastructure layers back online..."
  
  if bash "$START_SCRIPT"; then
    print_success "Infrastructure re-initialization completed successfully"
  else
    print_error "Start script encountered issues"
    exit 1
  fi
else
  print_error "Start script not found at: $START_SCRIPT"
  exit 1
fi

# ==============================================================================
# POST-RESTART VERIFICATION
# ==============================================================================
print_header "Phase 5: Post-Restart Verification"

print_step "Verifying container health states..."

# Get list of all containers for this project
CONTAINER_COUNT=$(docker ps --filter "name=${PROJECT_NAME}" -q 2>/dev/null | wc -l)

if [ "$CONTAINER_COUNT" -eq 0 ]; then
  print_error "No containers found after restart!"
  exit 1
fi

print_info "Container Summary:"
docker ps --filter "name=${PROJECT_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | tail -n +2 | while read -r line; do
  if echo "$line" | grep -q "Exited"; then
    print_error "  ✗ $line"
  elif echo "$line" | grep -q "Up"; then
    print_success "  ✓ $line"
  else
    print_warn "  ? $line"
  fi
done

echo ""

# Check for any exited containers
FAILED_CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" --filter "status=exited" -q 2>/dev/null || true)
if [ -n "$FAILED_CONTAINERS" ]; then
  print_warn "⚠️ Some containers are in exited state:"
  docker ps -a --filter "name=${PROJECT_NAME}" --filter "status=exited" --format "table {{.Names}}\t{{.Status}}"
  echo ""
  print_info "To investigate, run: docker logs <container_name>"
  exit 1
fi

# ==============================================================================
# SUCCESS REPORT
# ==============================================================================
echo ""
print_header "Restart Sequence Complete ✅"

print_success "All infrastructure services restarted and verified!"

if [ "$CLEAN_MODE" = "true" ]; then
  print_info "✨ Clean restart mode was active - volumes were wiped and recreated"
fi

print_info ""
print_info "📊 Current Infrastructure Status:"
show_docker_system_info

print_info "💡 Useful Commands:"
print_info "   • View logs:     docker logs <container_name>"
print_info "   • Stop services: bash stop.sh"
print_info "   • Full reset:    bash remove.sh"
print_info ""
