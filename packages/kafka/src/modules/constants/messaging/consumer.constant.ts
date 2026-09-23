export const KAFKA_CONSUMER = {
  RETRY_SUFFIX: 'retry',
  DLQ_SUFFIX: 'dlq',
  IN_PROCESS_ATTEMPTS: 3,
  IN_PROCESS_BACKOFF_MS: 200,
  RETRY_DELAY_MS: 5_000,
  MAX_RETRY_WAIT_MS: 30_000,
  ATTEMPTS_HEADER: 'x-attempts',
  ERROR_HEADER: 'x-last-error',
  TOPIC_HEADER: 'x-origin-topic',
  PARTITION_HEADER: 'x-origin-partition',
  OFFSET_HEADER: 'x-origin-offset',
  HANDLER_HEADER: 'x-handler',
  RETRY_AT_HEADER: 'x-retry-at',
  ERROR_MAX_LENGTH: 500
} as const;
