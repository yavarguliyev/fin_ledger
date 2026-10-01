export const TASK_TEST = {
  NAME: 'wallet.export',
  OTHER_NAME: 'wallet.reconcile',
  BASE_MS: 2_000,
  MAX_MS: 300_000,
  FIRST_ATTEMPT: 1,
  SECOND_ATTEMPT: 2,
  THIRD_ATTEMPT: 3,
  HUGE_ATTEMPT: 40,
  POLL_MS: 1_000,
  BATCH_SIZE: 5
} as const;
