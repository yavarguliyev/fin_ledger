const DEFAULTS = {
  POLL_MS: 1_000,
  BATCH_SIZE: 5,
  POLL_ENV: 'TASK_POLL_MS',
  BATCH_ENV: 'TASK_BATCH_SIZE'
} as const;

export const TASK_RUNTIME = {
  pollMs: (): number => Number(process.env[DEFAULTS.POLL_ENV]) || DEFAULTS.POLL_MS,
  batchSize: (): number => Number(process.env[DEFAULTS.BATCH_ENV]) || DEFAULTS.BATCH_SIZE
} as const;
