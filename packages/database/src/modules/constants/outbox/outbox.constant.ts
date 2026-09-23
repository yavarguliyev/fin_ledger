export const OUTBOX_CONSTANTS = {
  BACKOFF_BASE_SECONDS: 5,
  BACKOFF_MAX_SECONDS: 300,
  LAST_ERROR_MAX_LENGTH: 500,
  CLAIM_PENDING_BATCH_SQL: `
    UPDATE outbox_events
       SET locked_by = $1, locked_until = now() + make_interval(secs => $2)
     WHERE id IN (
       SELECT id
         FROM outbox_events
        WHERE status = 'PENDING'
          AND available_at <= now()
          AND (locked_until IS NULL OR locked_until < now())
        ORDER BY available_at, id
        LIMIT $3
          FOR UPDATE SKIP LOCKED
     )
 RETURNING id,
           aggregate_type AS "aggregateType",
           aggregate_id AS "aggregateId",
           event_type AS "eventType",
           payload,
           attempts,
           max_attempts AS "maxAttempts",
           destination
  `,
  MARK_PUBLISHED_SQL: `
    UPDATE outbox_events
       SET status = 'PUBLISHED', published_at = now(), last_error = NULL, locked_by = NULL, locked_until = NULL
     WHERE id = $1
  `,
  RESCHEDULE_FAILED_SQL: `
    UPDATE outbox_events
       SET attempts = attempts + 1,
           status = (CASE WHEN attempts + 1 >= max_attempts THEN 'DEAD' ELSE 'PENDING' END)::outbox_status,
           available_at = now() + make_interval(secs => $2),
           last_error = $3,
           locked_by = NULL,
           locked_until = NULL
     WHERE id = $1
 RETURNING status, attempts
  `
} as const;
