#!/usr/bin/env bash
# ==============================================================================
# DOCKER COMPOSE UTILITY LIBRARY
# Common functions to prevent docker-compose execution issues
# ==============================================================================

# Colors for professional console outputs
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Logging functions
print_info()    { echo -e "${GREEN}[INFO]    $1${NC}" >&2; }
print_warn()    { echo -e "${YELLOW}[WARN]    $1${NC}" >&2; }
print_error()   { echo -e "${RED}[ERROR]   $1${NC}" >&2; }
print_step()    { echo -e "${BLUE}[==>]     $1${NC}" >&2; }
print_success() { echo -e "${GREEN}✅ $1${NC}" >&2; }
print_header()  { echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2; echo -e "${GREEN}[PROCESS] $1${NC}" >&2; echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2; }

# ==============================================================================
# VALIDATION FUNCTIONS
# ==============================================================================

# Validate that docker is installed and running
validate_docker_available() {
  if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    return 1
  fi
  
  if ! docker ps &> /dev/null; then
    print_error "Docker daemon is not running or you don't have permissions"
    return 1
  fi
  
  return 0
}

# Validate that docker-compose is available
validate_docker_compose_available() {
  if ! docker compose version &> /dev/null; then
    print_error "Docker Compose v2 is not available"
    return 1
  fi
  return 0
}

# Validate compose file exists
validate_compose_file() {
  local compose_file=$1
  if [ ! -f "$compose_file" ]; then
    print_error "Docker Compose file not found: $compose_file"
    return 1
  fi
  return 0
}

# Validate env file exists (optional, but warn if missing)
validate_env_file() {
  local env_file=$1
  if [ ! -f "$env_file" ]; then
    print_warn "Environment file not found: $env_file"
    return 1
  fi
  return 0
}

# ==============================================================================
# DOCKER COMPOSE EXECUTION WRAPPERS
# ==============================================================================

# Execute docker-compose with error handling and retry logic
docker_compose_exec() {
  local operation=$1
  local compose_file=$2
  local env_file=$3
  local project_name=$4
  shift 4
  local extra_args=("$@")
  
  validate_docker_available || return 1
  validate_docker_compose_available || return 1
  validate_compose_file "$compose_file" || return 1
  
  local cmd="docker compose -f $compose_file"
  
  if [ -f "$env_file" ]; then
    cmd="$cmd --env-file $env_file"
  fi
  
  cmd="$cmd --project-name $project_name"
  cmd="$cmd $operation ${extra_args[*]}"
  
  print_step "Executing: $cmd"
  
  if eval "$cmd"; then
    return 0
  else
    print_error "Docker compose command failed: $operation"
    return 1
  fi
}

# Safe docker compose up with startup validation
docker_compose_up() {
  local compose_file=$1
  local env_file=$2
  local project_name=$3
  local timeout=${4:-60}
  
  validate_docker_available || return 1
  validate_docker_compose_available || return 1
  validate_compose_file "$compose_file" || return 1
  
  local cmd="docker compose -f $compose_file"
  [ -f "$env_file" ] && cmd="$cmd --env-file $env_file"
  cmd="$cmd --project-name $project_name up -d"
  
  print_step "Starting containers: $cmd"
  if eval "$cmd"; then
    print_success "Containers started successfully"
    
    # Wait for containers to stabilize
    print_info "Waiting for containers to stabilize (max ${timeout}s)..."
    sleep 5
    
    # Verify no containers are in error state
    local error_containers=$(docker ps -a --filter "name=${project_name}" --filter "status=exited" -q 2>/dev/null || true)
    if [ -n "$error_containers" ]; then
      print_warn "Some containers exited unexpectedly:"
      docker ps -a --filter "name=${project_name}" --filter "status=exited" --format "table {{.Names}}\t{{.Status}}"
      
      # Show logs for failed containers
      local container_count=$(echo "$error_containers" | wc -l)
      if [ "$container_count" -le 3 ]; then
        for container in $error_containers; do
          print_error "Logs for $container:"
          docker logs "$container" 2>&1 | tail -20
        done
      fi
      return 1
    fi
    
    return 0
  else
    print_error "Failed to start containers"
    return 1
  fi
}

# Safe docker compose down with timeout
docker_compose_down() {
  local compose_file=$1
  local env_file=$2
  local project_name=$3
  local remove_volumes=${4:-false}
  local timeout=${5:-15}
  
  validate_docker_available || return 1
  validate_docker_compose_available || return 1
  validate_compose_file "$compose_file" || return 1
  
  local cmd="docker compose -f $compose_file"
  [ -f "$env_file" ] && cmd="$cmd --env-file $env_file"
  cmd="$cmd --project-name $project_name down --timeout $timeout"
  
  if [ "$remove_volumes" = "true" ]; then
    cmd="$cmd -v"
  fi
  
  print_step "Stopping containers: $cmd"
  if eval "$cmd"; then
    print_success "Containers stopped successfully"
    
    # Force kill any remaining containers
    local stuck_containers=$(docker ps -a --filter "name=${project_name}" -q 2>/dev/null || true)
    if [ -n "$stuck_containers" ]; then
      print_warn "Force killing remaining containers..."
      docker kill $stuck_containers 2>/dev/null || true
      docker rm -f $stuck_containers 2>/dev/null || true
    fi
    
    return 0
  else
    print_error "Failed to stop containers gracefully, attempting force kill..."
    
    local stuck_containers=$(docker ps -a --filter "name=${project_name}" -q 2>/dev/null || true)
    if [ -n "$stuck_containers" ]; then
      docker kill $stuck_containers 2>/dev/null || true
      docker rm -f $stuck_containers 2>/dev/null || true
      print_success "Force killed remaining containers"
    fi
    
    return 0
  fi
}

# Wait for a specific container to be healthy
wait_for_container_health() {
  local container_name=$1
  local max_attempts=${2:-60}
  local attempt=0
  
  print_info "Waiting for $container_name to be healthy (max ${max_attempts}s)..."
  
  while [ $attempt -lt $max_attempts ]; do
    local status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
    
    if [ "$status" = "healthy" ]; then
      print_success "$container_name is healthy"
      return 0
    fi
    
    if [ "$status" = "unhealthy" ]; then
      print_error "$container_name is unhealthy"
      docker logs "$container_name" 2>&1 | tail -10
      return 1
    fi
    
    attempt=$((attempt + 1))
    sleep 1
  done
  
  print_warn "$container_name health check timed out after ${max_attempts}s"
  return 1
}

# Get container status
get_container_status() {
  local container_name=$1
  docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null || echo "not_found"
}

# Pull images with retry logic
docker_compose_pull_with_retry() {
  local compose_file=$1
  local env_file=$2
  local project_name=$3
  local max_retries=${4:-3}
  local retry=0
  
  validate_docker_available || return 1
  validate_docker_compose_available || return 1
  validate_compose_file "$compose_file" || return 1
  
  while [ $retry -lt $max_retries ]; do
    print_info "Pulling images (attempt $((retry + 1))/$max_retries)..."
    
    local cmd="COMPOSE_HTTP_TIMEOUT=300 docker compose -f $compose_file"
    [ -f "$env_file" ] && cmd="$cmd --env-file $env_file"
    cmd="$cmd --project-name $project_name pull"
    
    if eval "$cmd"; then
      print_success "Images pulled successfully"
      return 0
    fi
    
    retry=$((retry + 1))
    if [ $retry -lt $max_retries ]; then
      print_warn "Pull attempt failed, retrying in 5 seconds..."
      sleep 5
    fi
  done
  
  print_warn "Failed to pull images after $max_retries attempts (using cached images)"
  return 0
}

# Cleanup system resources
cleanup_docker_resources() {
  local aggressive=${1:-false}
  
  print_step "Cleaning up Docker resources..."
  
  docker container prune -f 2>/dev/null || true
  docker network prune -f 2>/dev/null || true
  
  if [ "$aggressive" = "true" ]; then
    print_warn "Running aggressive cleanup (removing dangling images)..."
    docker image prune -f 2>/dev/null || true
  fi
  
  print_success "Cleanup complete"
}

# Display docker system info
show_docker_system_info() {
  print_info "Docker System Information:"
  docker system df
  echo ""
}

# ==============================================================================
# ENTRYPOINT VERIFICATION
# ==============================================================================

# No longer needed - sentinel removed from architecture

# ==============================================================================
# EXPORT FUNCTIONS (make available to sourcing scripts)
# ==============================================================================

export -f print_info
export -f print_warn
export -f print_error
export -f print_step
export -f print_success
export -f print_header
export -f validate_docker_available
export -f validate_docker_compose_available
export -f validate_compose_file
export -f validate_env_file
export -f docker_compose_exec
export -f docker_compose_up
export -f docker_compose_down
export -f wait_for_container_health
export -f get_container_status
export -f docker_compose_pull_with_retry
export -f cleanup_docker_resources
export -f show_docker_system_info
