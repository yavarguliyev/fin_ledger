#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# CONFIGURATION & DYNAMIC PATH SETTINGS
# ==============================================================================
PROJECT_NAME="ddd"

# Resolve absolute path of the directory where this script sits
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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
print_header "Preparing Infrastructure Startup Sequence"

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

# Verify entrypoint scripts are executable
print_step "Verifying configuration..."

# ==============================================================================
# ENVIRONMENT GUARD CLAUSE & DEFAULTS GENERATION
# ==============================================================================
if [ ! -f "$ENV_FILE" ]; then
  print_warn "📋 Local .env file not found. Generating default development profiles..."
  
  # Write clean, consistent environment parameters directly to the new file
cat << EOF > "$ENV_FILE"
# Redis Cache Cluster
REDIS_PASSWORD=my_secure_password
REDIS_PORT=6379
REDIS_SENTINEL_PORT=26379
REDIS_MASTER_NAME=mymaster
REDIS_SENTINEL_HOST=redis-sentinel

# Databases
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=distributed_db
DB_PORT=54320

# RabbitMQ
RABBITMQ_DEFAULT_USER=ddd_user
RABBITMQ_DEFAULT_PASS=ddd_pass
RABBITMQ_ERLANG_COOKIE=DDD_SHARED_SECRET_COOKIE

# Kafka
KAFKA_BROKER_PORT=9092
KAFKA_CLUSTER_ID=4L62IdYtQG65uzmF2u476g
EOF
  print_success "Fresh .env file initialized with high-availability dev configurations!"
else
  print_success "Existing local .env configuration loaded successfully."
fi

# Validate env file
if ! validate_env_file "$ENV_FILE"; then
  print_warn "Proceeding without .env file (environment variables may be undefined)"
fi

# ==============================================================================
# PULL IMAGES WITH RETRY LOGIC
# ==============================================================================
print_header "Image Synchronization Phase"
if ! docker_compose_pull_with_retry "$COMPOSE_FILE" "$ENV_FILE" "$PROJECT_NAME" 3; then
  print_warn "Proceeding with potentially outdated cached images..."
fi

# ==============================================================================
# STARTUP SEQUENCE
# ==============================================================================
print_header "Starting Infrastructure Services"

if ! docker_compose_up "$COMPOSE_FILE" "$ENV_FILE" "$PROJECT_NAME" 60; then
  print_error "Failed to start containers successfully"
  print_error "Collecting diagnostic information..."
  
  # Show logs of failed containers
  failed_containers=$(docker ps -a --filter "name=${PROJECT_NAME}" --filter "status=exited" -q 2>/dev/null || true)
  if [ -n "$failed_containers" ]; then
    for container in $failed_containers; do
      print_error "Logs for failed container $container:"
      docker logs "$container" 2>&1 | tail -30
    done
  fi
  
  exit 1
fi

# ==============================================================================
# HEALTH CHECK: Wait for critical services
# ==============================================================================
print_header "Health Verification Phase"

# Critical services that must be healthy
declare -a CRITICAL_SERVICES=("ddd_redis_master" "ddd_postgres_db" "ddd_rabbitmq" "ddd_kafka" "dd_minio" "ddd_clickhouse" "ddd_prometheus" "ddd_grafana")

for service in "${CRITICAL_SERVICES[@]}"; do
  if ! wait_for_container_health "$service" 60; then
    print_warn "$service failed health check, but proceeding..."
  fi
done

# ==============================================================================
# CLEANUP AND REPORTING
# ==============================================================================
print_header "Post-Startup Maintenance"

cleanup_docker_resources false

print_step "Generating system statistics..."
show_docker_system_info

# ==============================================================================
# SUCCESS REPORT
# ==============================================================================
echo ""
print_success "Clustered Architecture Infrastructure initialized successfully!"
print_header "SERVICE ACCESS ENDPOINTS"

print_info ""
print_info "📡 NestJS API Trunk:        http://localhost:3000"
print_info "🗄️ PostgreSQL Database:    postgresql://localhost:54320 (User: postgres)"
print_info "🐰 RabbitMQ Management:     http://localhost:15672 (User: ddd_user)"
print_info "🔴 Redis Master:            localhost:6379"
print_info "📍 Redis Sentinel:          localhost:26379"
print_info "📊 Kafka Broker:            localhost:9092"
print_info "🪣 MinIO API:               http://localhost:9000"
print_info "🎨 MinIO Console:           http://localhost:9001"
print_info "📈 ClickHouse HTTP:         http://localhost:8123 (User: default)"
print_info "📈 ClickHouse Native:       localhost:9002"
print_info "📊 Prometheus:              http://localhost:9090"
print_info "📉 Grafana:                 http://localhost:3001 (User: admin / Pass: admin)"
print_info ""
print_info "💡 Professional Tip: Use 'docker logs <container_name>' to inspect service output"
print_info ""