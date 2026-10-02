export const SUPPORT_REPLY_TEST = {
  ORIGINAL: 'Where is my withdrawal?',
  REPLY: 'It is on its way, give it an hour',
  STRAY: 'This should not attach',
  OTHER_MESSAGE_SQL: 'SELECT id FROM support_messages WHERE conversation_id <> $1 LIMIT 1',
  BAD_REQUEST: 400
} as const;
