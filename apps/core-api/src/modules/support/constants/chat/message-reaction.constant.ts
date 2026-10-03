export const MESSAGE_REACTION = {
  TABLE: 'support_message_reactions',
  MAX_LENGTH: 16,
  GRAPHEME: 'grapheme',
  EMOJI_PATTERN: /\p{Extended_Pictographic}|\p{Regional_Indicator}/u,
  NOT_EMOJI_MESSAGE: 'A reaction must be a single emoji',
  NOT_FOUND_MESSAGE: 'Message not found',
  DELETED_MESSAGE: 'A deleted message cannot get reactions',
  SET_SQL: `
    INSERT INTO support_message_reactions (message_id, user_id, emoji)
    VALUES ($1, $2, $3)
    ON CONFLICT (message_id, user_id) DO UPDATE SET emoji = EXCLUDED.emoji, created_at = now()
  `,
  CLEAR_SQL: 'DELETE FROM support_message_reactions WHERE message_id = $1 AND user_id = $2',
  LIST_SQL: `
    SELECT emoji, user_id AS "userId" FROM support_message_reactions
     WHERE message_id = $1
     ORDER BY created_at
  `,
  AGGREGATE_COLUMN: `COALESCE((
             SELECT jsonb_agg(jsonb_build_object('emoji', r.emoji, 'userId', r.user_id) ORDER BY r.created_at)
               FROM support_message_reactions r WHERE r.message_id = m.id
           ), '[]'::jsonb) AS "reactions"`
} as const;
