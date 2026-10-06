export const SUPPORT_LOCK = {
  TABLE: 'support_conversation_locks',
  LOCK_SQL: `
    INSERT INTO support_conversation_locks (conversation_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (conversation_id, user_id) DO NOTHING
  `,
  REMOVE_SQL: 'DELETE FROM support_conversation_locks WHERE conversation_id = $1 AND user_id = $2',
  OPEN_WINDOW_SQL: `
    UPDATE support_conversation_locks
       SET unlocked_until = now() + make_interval(secs => $3::int)
     WHERE conversation_id = $1 AND user_id = $2
  `,
  STATE_SQL: `
    SELECT true AS locked, coalesce(unlocked_until > now(), false) AS open
      FROM support_conversation_locks
     WHERE conversation_id = $1 AND user_id = $2
  `,
  WINDOW_SECONDS: 300,
  UNLOCKED_STATE: { locked: false, open: true },
  CLOSED_STATE: { locked: true, open: false },
  LOCKED_MESSAGE: 'This chat is locked. Confirm with your passkey to open it.'
} as const;
