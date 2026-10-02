export const OUTBOX_LAG_TEST = {
  AGE_SECONDS: 120,
  INSERT_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, destination, created_at, available_at)
               VALUES ('User', gen_random_uuid(), 'lag.probe', 1, '{"lagProbe": true}'::jsonb, 'KAFKA', now() - make_interval(secs => $1), now() + interval '1 day')
               RETURNING id`,
  CLEANUP_SQL: "UPDATE outbox_events SET status = 'DEAD', locked_by = NULL, locked_until = NULL WHERE id = $1",
  METRIC_PATTERN: /^core_api_outbox_oldest_pending_seconds (\S+)$/m,
  API_SUFFIX: /\/api\/v\d+$/,
  METRICS_PATH: '/metrics'
} as const;
