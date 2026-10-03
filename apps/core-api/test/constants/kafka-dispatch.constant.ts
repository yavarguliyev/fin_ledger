export const KAFKA_DISPATCH_TEST = {
  CONSUMER_GROUP: 'integration-dispatch',
  LOGGER: 'KafkaDlqSpec',
  PREFIX: 'probe.',
  KEY: 'probe-key',
  PAYLOAD: { probe: true },
  PARTITION: 0,
  OFFSET: '42',
  FAILURE: 'handler always throws',
  FAILING: 'failing',
  HEALTHY: 'healthy',
  COUNTING: 'counting',
  FIRST_ATTEMPT: '1',
  SECOND_ATTEMPT: '2',
  CLEANUP_SQL: "DELETE FROM inbox_messages WHERE consumer LIKE 'integration-dispatch%'",
  INBOX_SQL: 'SELECT consumer, message_id, topic FROM inbox_messages WHERE message_id = $1'
} as const;
