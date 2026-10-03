export const OUTBOX_PROBE = {
  LOCK_SECONDS: 30,
  BATCH_LIMIT: 50,
  MAX_ATTEMPTS: 3,
  PARKED_SECONDS: 3600,
  RELAY_WAIT_MS: 20_000,
  RELAY_POLL_MS: 250,
  FAILURE: 'broker unavailable',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  DEAD: 'DEAD',
  RELAY_A: 'relay-a',
  RELAY_B: 'relay-b',
  CRASHED_RELAY: 'crashed-relay',
  LIVE_RELAY: 'live-relay',
  BEGIN: 'BEGIN',
  COMMIT: 'COMMIT',
  ROLLBACK: 'ROLLBACK',
  ANY_USER_SQL: 'SELECT id FROM users LIMIT 1',
  SEED_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, max_attempts, available_at, locked_by, locked_until)
             VALUES ('WALLET', $1, $2, $3, '{"probe": true}'::jsonb, $4, now() + make_interval(secs => $5),
                     $6, CASE WHEN $7::int IS NULL THEN NULL ELSE now() + make_interval(secs => $7::int) END)
             RETURNING id`,
  MAKE_DUE_SQL: 'UPDATE outbox_events SET available_at = now() WHERE id = ANY($1)',
  READ_SQL: `SELECT status::text AS status, attempts, locked_by, EXTRACT(EPOCH FROM (available_at - now())) AS delay_seconds
               FROM outbox_events WHERE id = $1`,
  ROLLED_BACK_INSERT_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, destination)
                           VALUES ('User', $1, $2, $3, '{"probe": true}'::jsonb, 'KAFKA')`,
  FIND_VERSION_SQL: 'SELECT id FROM outbox_events WHERE aggregate_id = $1 AND aggregate_version = $2',
  CLEANUP_SQL: `UPDATE outbox_events SET status = 'DEAD', locked_by = NULL, locked_until = NULL
                 WHERE payload @> '{"probe": true}'::jsonb AND status = 'PENDING'`
} as const;
