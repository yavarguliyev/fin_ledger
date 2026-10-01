export const CPU_POOL = {
  RESERVED_THREADS: 1,
  MIN_WORKERS: 1,
  QUEUE_LIMIT: 64,
  TIMEOUT_MS: 30_000,
  CLEAN_EXIT: 0,
  QUEUE_FULL_MESSAGE: 'The CPU task pool is full',
  TIMEOUT_MESSAGE: 'The CPU task exceeded its timeout',
  EXIT_MESSAGE: 'The CPU task worker exited with code',
  QUEUE_FULL_CODE: 'CPU_POOL_FULL',
  TIMEOUT_CODE: 'CPU_TASK_TIMEOUT',
  EXIT_CODE: 'CPU_WORKER_EXIT'
} as const;
