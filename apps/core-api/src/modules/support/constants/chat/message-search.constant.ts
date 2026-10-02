export const MESSAGE_SEARCH = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  LIMIT: 30,
  WILDCARD: '%',
  SPECIAL_CHARACTERS: /[\\%_]/g,
  ESCAPED: '\\$&',
  SQL: `
    SELECT m.id, m.sender_user_id AS "senderUserId", m.body, m.created_at AS "createdAt"
      FROM support_messages m
     WHERE m.conversation_id = $1
       AND m.deleted_at IS NULL
       AND m.body ILIKE $2 ESCAPE '\\'
       AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = m.id AND h.user_id = $3)
     ORDER BY m.created_at DESC
     LIMIT $4
  `
} as const;
