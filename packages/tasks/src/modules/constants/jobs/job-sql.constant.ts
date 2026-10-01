export const JOB_SQL = {
  ENQUEUE: `
    INSERT INTO jobs (name, payload, run_at, max_attempts, dedupe_key)
    VALUES ($1, $2::jsonb, COALESCE($3::timestamptz, now()), $4, $5)
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL AND status IN ('PENDING', 'RUNNING')
    DO NOTHING
    RETURNING id
  `,
  CLAIM: `
    WITH claimable AS (
      SELECT id FROM jobs
      WHERE status = 'PENDING' AND run_at <= now()
      ORDER BY run_at
      FOR UPDATE SKIP LOCKED
      LIMIT $1
    )
    UPDATE jobs SET status = 'RUNNING', locked_at = now(), attempts = attempts + 1, updated_at = now()
    WHERE id IN (SELECT id FROM claimable)
    RETURNING id, name, payload, attempts, max_attempts AS "maxAttempts"
  `,
  COMPLETE: `UPDATE jobs SET status = 'DONE', locked_at = NULL, last_error = NULL, updated_at = now() WHERE id = $1`,
  RESCHEDULE: `
    UPDATE jobs
    SET status = 'PENDING', locked_at = NULL, last_error = $2, run_at = now() + ($3::int * interval '1 millisecond'), updated_at = now()
    WHERE id = $1
  `,
  BURY: `UPDATE jobs SET status = 'DEAD', locked_at = NULL, last_error = $2, updated_at = now() WHERE id = $1`,
  REPLAY: `
    UPDATE jobs SET status = 'PENDING', attempts = 0, last_error = NULL, run_at = now(), updated_at = now()
    WHERE id = $1 AND status = 'DEAD'
    RETURNING id
  `,
  ADVISORY_LOCK: 'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS acquired'
} as const;
