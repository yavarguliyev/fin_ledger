export const OPERATION_LIMITS = {
  DEADLINE_MS: 25_000,
  MAX_CONCURRENT: 8,
  QUEUE_LIMIT: 32,
  POLL_MS: 5,
  DEADLINE_MESSAGE: 'took longer than the allowed deadline',
  BULKHEAD_MESSAGE: 'has too many calls in flight'
} as const;
