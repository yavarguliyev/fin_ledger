export const JOB = {
  TABLE: 'jobs',
  STATUS: { PENDING: 'PENDING', RUNNING: 'RUNNING', DONE: 'DONE', DEAD: 'DEAD' },
  DEFAULT_MAX_ATTEMPTS: 5,
  DEFAULT_BATCH_SIZE: 5,
  DEFAULT_POLL_MS: 1_000,
  BACKOFF_BASE_MS: 2_000,
  BACKOFF_MAX_MS: 300_000,
  BACKOFF_FACTOR: 2,
  HANDLER_METADATA: 'common:tasks:handler',
  SCHEDULE_METADATA: 'common:tasks:schedule',
  NO_HANDLER_MESSAGE: 'No task handler is registered for',
  NOT_DEAD_MESSAGE: 'Only a dead job can be replayed'
} as const;
