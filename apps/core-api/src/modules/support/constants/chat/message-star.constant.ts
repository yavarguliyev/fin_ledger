export const MESSAGE_STAR = {
  NOT_FOUND_MESSAGE: 'Message not found',
  DELETED_MESSAGE: 'A deleted message cannot be starred',
  STAR_SQL: `
    INSERT INTO support_message_stars (message_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (message_id, user_id) DO NOTHING
  `,
  UNSTAR_SQL: 'DELETE FROM support_message_stars WHERE message_id = $1 AND user_id = $2',
  LIST_SQL: `
    SELECT m.id AS "messageId", m.conversation_id AS "conversationId", m.kind, m.body, m.file_name AS "fileName",
           m.created_at AS "createdAt", s.created_at AS "starredAt"
      FROM support_message_stars s
      JOIN support_messages m ON m.id = s.message_id
     WHERE s.user_id = $1 AND m.conversation_id = $2 AND m.deleted_at IS NULL
     ORDER BY s.created_at DESC
  `
} as const;
