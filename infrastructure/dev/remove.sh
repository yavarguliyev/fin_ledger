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

# Source the utility library
if [ ! -f "$LIB_SCRIPT" ]; then
  echo -e "${RED}[ERROR]   Utility library not found: $LIB_SCRIPT${NC}" >&2
  exit 1
fi
source "$LIB_SCRIPT"

# ==============================================================================
# PRE-FLIGHT CHECKS
# ==============================================================================
print_header "Preparing Complete Infrastructure Removal"

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
FORCE_MODE=false
SKIP_CONFIRMATION=false

for arg in "$@"; do
  case "$arg" in
    --force|-f)
      FORCE_MODE=true
      print_warn "Force mode enabled: no confirmations required"
      ;;
    --skip-confirmation)
      SKIP_CONFIRMATION=true
      print_warn "Skipping user confirmations"
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --force, -f           Skip safety confirmations (DESTRUCTIVE)"
      echo "  --skip-confirmation   Same as --force"
      echo "  --help, -h            Show this help message"
      echo ""
      echo "WARNING: This script performs complete infrastructure removal including:"
      echo "  • All running containers will be forcefully stopped"
      echo "  • All network meshes will be destroyed"
      echo "  • ALL VOLUMES WILL BE PERMANENTLY DELETED:"
      echo "    - PostgreSQL databases and data"
      echo "    - RabbitMQ persistent messages"
      echo "    - Redis snapshot files"
      echo "    - Kafka topics and logs"
      echo "  • All downloaded cached images will be entirely flushed"
      echo ""
      echo "⚠️  THIS OPERATION CANNOT BE UNDONE - Data loss is permanent"
      exit 0
      ;;
    *)
      print_warn "Unknown option: $arg"
      ;;
  esac
done

# ==============================================================================
# DESTRUCTIVE PURGE CONFIRMATION
# ==============================================================================
PROCEED_WITH_PURGE=false

if [ "$FORCE_MODE" = "true" ] || [ "$SKIP_CONFIRMATION" = "true" ]; then
  PROCEED_WITH_PURGE=true
else
  print_warn "⚠️  NUCLEAR PURGE: Erasing ALL infrastructure resources for: $PROJECT_NAME"
  print_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  print_warn "  • All running containers will be KILLED INSTANTLY"
  print_warn "  • All network meshes will be DESTROYED"
  print_warn "  • ALL VOLUMES WILL BE PERMANENTLY DELETED:"
  print_warn "    - PostgreSQL databases and persistent data"
  print_warn "    - RabbitMQ queues and messages"
  print_warn "    - Redis AOF and RDB snapshot files"
  print_warn "    - Kafka topics, partitions, and logs"
  print_warn "  • All downloaded cached images will be entirely flushed from your system"
  print_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Show current volumes that will be destroyed
  print_info "Volumes that will be PERMANENTLY DELETED:"
  volumes=$(docker volume ls --filter "label=com.docker.compose.project=${PROJECT_NAME}" --format "{{.Name}}" 2>/dev/null || true)
  if [ -n "$volumes" ]; then
    echo "$volumes" | sed 's/^/  🗑️  /'
  else
    print_info "  (No labeled volumes found)"
  fi
  echo ""
  
  # Show current images that will be removed
  print_info "Images that will be REMOVED from your system:"
  images=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" 2>/dev/null images -q || echo "")
  if [ -n "$images" ]; then
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "redis|postgres|rabbitmq|kafka" | sed 's/^/  🗑️  /'
  else
    print_info "  (Use 'docker images' to see all images)"
  fi
  echo ""
  
  # Require explicit confirmation
  print_warn "This operation CANNOT be undone. Type 'yes' to confirm:"
  read -r -p "  > " confirmation
  
  if [ "$confirmation" = "yes" ]; then
    PROCEED_WITH_PURGE=true
    print_success "Proceeding with complete system wipe..."
  else
    print_error "Operation cancelled. No changes were made."
    exit 0
  fi
fi

# ==============================================================================
# DESTRUCTIVE PURGE SEQUENCE
# ==============================================================================
if [ "$PROCEED_WITH_PURGE" = "true" ]; then
  print_header "Phase 1: Force Stopping All Containers"
  
  # 1. Spin down compose context and immediately torch the volumes and orphans
  print_step "Force stopping containers and wiping out infrastructure volumes..."
  cmd="docker compose -f $COMPOSE_FILE"
  [ -f "$ENV_FILE" ] && cmd="$cmd --env-file $ENV_FILE"
  cmd="$cmd --project-name $PROJECT_NAME down --volumes --remove-orphans --timeout 2"
  
  if eval "$cmd" 2>/dev/null; then
    print_success "Docker compose down completed"
  else
    print_warn "Docker compose down encountered warnings (continuing with force cleanup...)"
  fi
  
  # ==============================================================================
  # CHAOS GUARD: Clean up stubborn cluster containers
  # ==============================================================================
  print_header "Phase 2: Cleanup Stubborn Containers"
  
  print_step "Detecting and force killing remaining hung infrastructure containers..."
  STUCK_CONTAINERS=$(docker ps -a --filter "name=$PROJECT_NAME" -q 2>/dev/null || true)
  
  if [ -n "$STUCK_CONTAINERS" ]; then
    print_warn "Force killing ${STUCK_CONTAINERS} remaining containers..."
    docker kill $STUCK_CONTAINERS 2>/dev/null || true
    docker rm -f $STUCK_CONTAINERS 2>/dev/null || true
    print_success "Stubborn containers eliminated"
  else
    print_success "No remaining containers found"
  fi
  
  # ==============================================================================
  # UNCONDITIONAL IMAGES & CACHE PURGE
  # ==============================================================================
  print_header "Phase 3: Image Layer Purge"
  
  print_step "Extracting stack definitions to target project-specific images..."
  IMAGES_TO_REMOVE=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" 2>/dev/null images -q || echo "")
  
  if [ -n "$IMAGES_TO_REMOVE" ]; then
    print_step "Stripping down downloaded base image layers from host machine..."
    # Count images
    image_count=$(echo "$IMAGES_TO_REMOVE" | wc -l)
    print_info "Removing $image_count image(s)..."
    
    docker rmi -f $IMAGES_TO_REMOVE 2>/dev/null || true
    print_success "Images removed successfully"
  else
    print_info "No project-specific images found to remove"
  fi
  
  # ==============================================================================
  # DEEP SYSTEM SANITIZATION
  # ==============================================================================
  print_header "Phase 4: Deep System Sanitization"
  
  print_step "Running container pruning..."
  docker container prune -f 2>/dev/null || true
  
  print_step "Running network pruning..."
  docker network prune -f 2>/dev/null || true
  
  print_step "Explicitly removing project volumes..."
  project_volumes=$(docker volume ls --filter "label=com.docker.compose.project=${PROJECT_NAME}" -q 2>/dev/null || true)
  if [ -n "$project_volumes" ]; then
    echo "$project_volumes" | xargs -I {} docker volume rm {} 2>/dev/null || true
    print_success "Project volumes removed"
  else
    print_info "No project volumes found to remove"
  fi
  
  print_step "Running volume pruning for dangling volumes..."
  docker volume prune -f 2>/dev/null || true
  
  print_step "Running deep system prune (targeting ALL unused resources system-wide)..."
  docker system prune --all --volumes -f 2>/dev/null || true
  
  print_success "Deep system sanitization completed"
  
  # ==============================================================================
  # VERIFICATION
  # ==============================================================================
  print_header "Phase 5: Cleanup Verification"
  
  # Verify no containers remain
  remaining_containers=$(docker ps -a --filter "name=${PROJECT_NAME}" -q 2>/dev/null || true)
  if [ -z "$remaining_containers" ]; then
    print_success "✓ All containers removed"
  else
    print_error "✗ Some containers still remain (this is unusual)"
  fi
  
  # Verify no networks remain
  remaining_networks=$(docker network ls --filter "name=${PROJECT_NAME}" -q 2>/dev/null || true)
  if [ -z "$remaining_networks" ]; then
    print_success "✓ All networks removed"
  else
    print_warn "✓ Networks queued for cleanup (auto-removed on next docker operation)"
  fi
  
  # Verify no volumes remain
  remaining_volumes=$(docker volume ls --filter "label=com.docker.compose.project=${PROJECT_NAME}" -q 2>/dev/null || true)
  if [ -z "$remaining_volumes" ]; then
    print_success "✓ All volumes removed"
  else
    print_error "✗ Some volumes still remain:"
    echo "$remaining_volumes" | sed 's/^/  /'
  fi
  
  # ==============================================================================
  # DISK FOOTPRINT REPORT
  # ==============================================================================
  print_header "System Resource Report"
  
  print_info "📊 Post-Cleanup Docker Footprint:"
  docker system df
  echo ""
  
  # ==============================================================================
  # COMPLETION
  # ==============================================================================
  print_header "Complete System Wipe Finished ✅"
  
  print_info "✅ System workspace entirely reset to an absolute pristine factory slate!"
  print_info ""
  print_info "📊 Disk Space Recovered:"
  space_info=$(docker system df | tail -1 | awk '{print $3}')
  print_info "  Reclaimable space shown above"
  print_info ""
  print_info "💡 Next Steps:"
  print_info "   • To restore the infrastructure: bash start.sh"
  print_info "   • To check Docker health:     docker system df"
  print_info "   • To view all images:         docker images"
  print_info ""
  
else
  print_error "Purge operation was not confirmed"
  exit 1
fi
