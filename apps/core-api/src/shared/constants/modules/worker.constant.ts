export const WORKER = {
  POLL_MS: 1_000,
  BATCH_SIZE: 5,
  CONTEXT: 'Worker',
  STARTED_MESSAGE: 'Task worker is running',
  FAILURE_EXIT_CODE: 1
} as const;
