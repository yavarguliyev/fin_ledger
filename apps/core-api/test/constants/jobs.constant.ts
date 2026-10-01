export const JOBS_TEST = {
  NAME: 'integration.export',
  DEDUPE_KEY: 'integration-export-once',
  ENQUEUE_SQL: `
    INSERT INTO jobs (name, payload, max_attempts, dedupe_key, run_at)
    VALUES ($1, $2::jsonb, $3, $4, now() + interval '1 hour')
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL AND status IN ('PENDING', 'RUNNING')
    DO NOTHING
    RETURNING id
  `,
  CLAIM_SQL: `
    WITH claimable AS (
      SELECT id FROM jobs
      WHERE status = 'PENDING' AND name = $2
      ORDER BY run_at
      FOR UPDATE SKIP LOCKED
      LIMIT $1
    )
    UPDATE jobs SET status = 'RUNNING', locked_at = now(), attempts = attempts + 1, updated_at = now()
    WHERE id IN (SELECT id FROM claimable)
    RETURNING id, name, attempts, max_attempts AS "maxAttempts"
  `,
  BURY_SQL: "UPDATE jobs SET status = 'DEAD', last_error = $2 WHERE id = $1",
  REPLAY_SQL: `
    UPDATE jobs SET status = 'PENDING', attempts = 0, last_error = NULL, run_at = now() + interval '1 hour'
    WHERE id = $1 AND status = 'DEAD'
    RETURNING id
  `,
  COUNT_SQL: 'SELECT count(*)::int AS count FROM jobs WHERE name = $1',
  STATUS_SQL: 'SELECT status, attempts FROM jobs WHERE id = $1',
  CLEAN_SQL: 'DELETE FROM jobs WHERE name = $1',
  MAX_ATTEMPTS: 2,
  BATCH: 10,
  FAILURE: 'export failed',
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  DEAD: 'DEAD'
} as const;
