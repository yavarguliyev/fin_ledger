export const OUTBOX_DRAIN_TEST = {
  BATCH_SIZE: 50,
  FULL_BATCHES: 3,
  LAST_BATCH: 7,
  EVENT_TYPE: 'user.registered',
  KAFKA: 'KAFKA',
  RELAY_POLL: 'poll'
} as const;
