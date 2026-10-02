export const AUDIT_LOG_TEST = {
  SQL: 'SELECT action, entity_type, entity_id FROM audit_log WHERE entity_id = $1 AND action = $2',
  TIMEOUT_MS: 20_000,
  INTERVAL_MS: 250
} as const;
