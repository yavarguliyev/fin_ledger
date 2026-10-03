export const RETENTION = {
  TASK_NAME: 'retention.prune',
  DEFAULT_INTERVAL_MS: 3_600_000,
  DEFAULT_OUTBOX_DAYS: 7,
  DEFAULT_WEBHOOK_DAYS: 90,
  DEFAULT_NOTIFICATION_DAYS: 90,
  DEFAULT_LOGIN_EVENT_DAYS: 365,
  INTERVAL_KEY: 'RETENTION_INTERVAL_MS',
  OUTBOX_DAYS_KEY: 'RETENTION_OUTBOX_DAYS',
  WEBHOOK_DAYS_KEY: 'RETENTION_WEBHOOK_DAYS',
  NOTIFICATION_DAYS_KEY: 'RETENTION_NOTIFICATION_DAYS',
  LOGIN_EVENT_DAYS_KEY: 'RETENTION_LOGIN_EVENT_DAYS',
  DELETE_OUTBOX_SQL: "DELETE FROM outbox_events WHERE status = 'PUBLISHED' AND published_at < now() - make_interval(days => $1)",
  DELETE_WEBHOOKS_SQL: "DELETE FROM webhook_events WHERE status = 'PROCESSED' AND processed_at < now() - make_interval(days => $1)",
  DELETE_NOTIFICATIONS_SQL: "DELETE FROM notifications WHERE status = 'READ' AND created_at < now() - make_interval(days => $1)",
  DELETE_LOGIN_EVENTS_SQL: 'DELETE FROM login_events WHERE created_at < now() - make_interval(days => $1)'
} as const;
