export const INBOX_CONSTANTS = {
  MARK_PROCESSED_SQL: `
    INSERT INTO inbox_messages (consumer, message_id, topic)
         VALUES ($1, $2, $3)
    ON CONFLICT (consumer, message_id) DO NOTHING
      RETURNING message_id
  `,
  WAS_PROCESSED_SQL: 'SELECT 1 FROM inbox_messages WHERE consumer = $1 AND message_id = $2'
} as const;
