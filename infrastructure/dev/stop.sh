#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# CONFIGURATION & STATIC SETTINGS
# ==============================================================================
PROJECT_NAME="ddd"

# Ensure script runs from the directory it is located in
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_FILE="${SCRIPT_DIR}/.env"
LIB_SCRIPT="${SCRIPT_DIR}/lib-docker.sh"
SHUTDOWN_TIMEOUT_SEC=15 # Native grace window for databases to flush memory to disk

# Source the utility library
if [ ! -f "$LIB_SCRIPT" ]; then
  echo -e "${RED}[ERROR]   Utility library not found: $LIB_SCRIPT${NC}" >&2
  exit 1
fi
source "$LIB_SCRIPT"

# ==============================================================================
# PRE-FLIGHT CHECKS
# ==============================================================================
print_header "Preparing Infrastructure Shutdown Sequence"

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
# RUNTIME INTERACTIVE LISTING & TEARDOWN
# ==============================================================================
print_info "🛑 Preparing to tear down the infrastructure..."
print_header "Current Infrastructure Status"

# List active containers matched via the local network or stack name
ACTIVE_COUNT=$(docker ps --filter "name=$PROJECT_NAME" -q 2>/dev/null | wc -l)

if [ "${ACTIVE_COUNT}" -eq 0 ]; then
  print_warn "No active infrastructure containers found for project: $PROJECT_NAME"
  print_info "Infrastructure may already be stopped."
else
  print_info "Currently active cluster containers (${ACTIVE_COUNT} found):"
  docker ps --filter "name=$PROJECT_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  echo ""
fi

# ==============================================================================
# GRACEFUL SHUTDOWN SEQUENCE
# ==============================================================================
print_header "Graceful Shutdown Phase"

# Stop containers gracefully with timeout
if ! docker_compose_down "$COMPOSE_FILE" "$ENV_FILE" "$PROJECT_NAME" false "$SHUTDOWN_TIMEOUT_SEC"; then
  print_error "Graceful shutdown encountered issues, but cleanup was attempted"
fi

# ==============================================================================
# VERIFY CLEANUP
# ==============================================================================
print_header "Cleanup Verification"

# Double-check that all containers are removed
REMAINING_CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" -q 2>/dev/null || true)

if [ -n "$REMAINING_CONTAINERS" ]; then
  print_error "Warning: Some containers still exist after shutdown:"
  docker ps -a --filter "name=${PROJECT_NAME}" --format "table {{.Names}}\t{{.Status}}"
  echo ""
else
  print_success "All containers successfully removed"
fi

# Verify networks are cleaned up
REMAINING_NETWORKS=$(docker network ls --filter "name=${PROJECT_NAME}" -q 2>/dev/null || true)
if [ -n "$REMAINING_NETWORKS" ]; then
  print_warn "Networks still exist (will be auto-removed on next compose up):"
  docker network ls --filter "name=${PROJECT_NAME}" --format "table {{.Name}}\t{{.Driver}}"
else
  print_success "All networks cleaned up"
fi

# ==============================================================================
# OPTIONAL MAINTENANCE HOOK: CLEAN DATA STATE
# ==============================================================================
CLEAN_VOLUMES=false

# If an argument '--clean', '-c', or '--wipe' is explicitly passed, wipe down the data state
if [[ "${1:-}" == "--clean" || "${1:-}" == "-c" || "${1:-}" == "--wipe" || "${1:-}" == "-w" ]]; then
  print_header "Volume Purge Mode Activated"
  print_warn "🧹 Clean Flag Detected! Purging persistent docker volumes..."
  print_warn "⚠️ WARNING: This will erase all database data, Redis state, and Kafka messages!"
  print_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # List volumes that will be removed
  local volumes_to_remove=$(docker volume ls --filter "label=com.docker.compose.project=${PROJECT_NAME}" -q 2>/dev/null || true)
  
  if [ -n "$volumes_to_remove" ]; then
    print_info "Volumes to be purged:"
    echo "$volumes_to_remove" | sed 's/^/  • /'
    echo ""
  fi
  
  # Perform volume removal via docker-compose
  local cmd="docker compose -f $COMPOSE_FILE"
  [ -f "$ENV_FILE" ] && cmd="$cmd --env-file $ENV_FILE"
  cmd="$cmd --project-name $PROJECT_NAME down -v --remove-orphans"
  
  print_step "Executing volume purge: $cmd"
  if eval "$cmd"; then
    print_success "All volumes successfully purged!"
    
    # Manual cleanup of any remaining volumes
    local orphaned_volumes=$(docker volume ls --filter "name=${PROJECT_NAME}" -q 2>/dev/null || true)
    if [ -n "$orphaned_volumes" ]; then
      print_warn "Removing orphaned volumes..."
      for volume in $orphaned_volumes; do
        docker volume rm "$volume" 2>/dev/null || true
      done
      print_success "Orphaned volumes cleaned up"
    fi
  else
    print_error "Volume purge encountered errors"
    exit 1
  fi
  
  CLEAN_VOLUMES=true
fi

# ==============================================================================
# CLEANUP SYSTEM RESOURCES
# ==============================================================================
print_header "System Resource Cleanup"

cleanup_docker_resources false

# ==============================================================================
# COMPLETION
# ==============================================================================
echo ""
print_header "Shutdown Complete"
print_success "All high-availability cluster services stopped safely!"

if [ "$CLEAN_VOLUMES" = "true" ]; then
  print_info "✨ All volumes have been purged. Next startup will be a clean slate initialization."
else
  print_info "💾 Data volumes preserved. To also clean volumes, run: bash stop.sh --clean"
fi

print_info ""
print_info "💡 To re-launch the system infrastructure: bash start.sh"
print_info "💡 To perform a complete reset: bash remove.sh"
echo ""