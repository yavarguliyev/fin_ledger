export const RETENTION_TEST = {
  OUTBOX_DAYS: 7,
  WEBHOOK_DAYS: 90,
  STALE_EXTRA_DAYS: 3,
  FRESH_DAYS: 1,
  PENDING_EXTRA_DAYS: 30,
  VERSION_SPREAD: 100,
  PENDING_VERSION_OFFSET: 999,
  PERMISSION_DENIED: /permission denied/i,
  FIRST_USER_SQL: 'SELECT id FROM users LIMIT 1',
  PUBLISHED_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, status, published_at)
    VALUES ('User', $1, 'none', $2, '{"retention": true}'::jsonb, 'PUBLISHED', now() - make_interval(days => $3))
    RETURNING id`,
  PENDING_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, created_at, available_at)
    VALUES ('User', $1, 'none', $2, '{"retention": true}'::jsonb, now() - make_interval(days => $3), now() + interval '1 hour')
    RETURNING id`,
  IDS_SQL: 'SELECT id FROM outbox_events WHERE id = ANY($1)'
} as const;
