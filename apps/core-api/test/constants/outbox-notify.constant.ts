export const OUTBOX_NOTIFY_TEST = {
  CHANNEL: 'outbox_events',
  LISTEN_SQL: 'LISTEN outbox_events',
  INSERT_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, destination, available_at)
               VALUES ('User', gen_random_uuid(), 'notify.probe', 1, '{"notifyProbe": true}'::jsonb, 'KAFKA', now() + interval '1 day') RETURNING id`,
  CLEANUP_SQL: "UPDATE outbox_events SET status = 'DEAD', locked_by = NULL, locked_until = NULL WHERE id = $1",
  NOTIFICATION_EVENT: 'notification',
  TIMEOUT_MS: 5_000
} as const;
