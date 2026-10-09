export const SUPPORT_HISTORY = {
  TABLE: 'support_hidden_messages',
  MAX_MESSAGES: 100,
  ROUTES: {
    CLEAR: 'conversations/:id/clear',
    DELETE_MANY: 'conversations/:id/messages/delete'
  },
  CLEAR_SQL: `
    WITH hidden AS (
      INSERT INTO support_hidden_messages (message_id, user_id)
      SELECT m.id, $2
        FROM support_messages m
       WHERE m.conversation_id = $1
         AND (NOT $3::boolean OR NOT EXISTS (SELECT 1 FROM support_message_stars s WHERE s.message_id = m.id AND s.user_id = $2))
      ON CONFLICT (message_id, user_id) DO NOTHING
      RETURNING message_id
    )
    SELECT count(*)::int AS "count" FROM hidden
  `
} as const;
