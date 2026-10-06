export const RABBITMQ_UNSUBSCRIBE_TEST = {
  URL: 'amqp://test',
  FIRST_QUEUE: 'notifications.wallet.credited',
  SECOND_QUEUE: 'notifications.wallet.debited',
  FIRST_TAG: 'tag-1',
  SECOND_TAG: 'tag-2',
  UNKNOWN_QUEUE: 'notifications.unknown'
} as const;
