export const METRICS = {
  PREFIX: 'core_api_',
  CONTENT_TYPE_HEADER: 'content-type',
  POOL_TOTAL: 'db_pool_connections_total',
  POOL_IDLE: 'db_pool_connections_idle',
  POOL_WAITING: 'db_pool_connections_waiting',
  OUTBOX_PENDING: 'outbox_events_pending',
  OUTBOX_DEAD: 'outbox_events_dead',
  PENDING_SQL: "SELECT count(*) FILTER (WHERE status = 'PENDING') AS pending, count(*) FILTER (WHERE status = 'DEAD') AS dead FROM outbox_events"
} as const;
