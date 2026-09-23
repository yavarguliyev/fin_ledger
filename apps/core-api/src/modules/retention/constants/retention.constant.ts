export const RETENTION = {
  DEFAULT_INTERVAL_MS: 3_600_000,
  DEFAULT_OUTBOX_DAYS: 7,
  DEFAULT_WEBHOOK_DAYS: 90,
  DELETE_OUTBOX_SQL: "DELETE FROM outbox_events WHERE status = 'PUBLISHED' AND published_at < now() - make_interval(days => $1)",
  DELETE_WEBHOOKS_SQL: "DELETE FROM webhook_events WHERE status = 'PROCESSED' AND processed_at < now() - make_interval(days => $1)"
} as const;
