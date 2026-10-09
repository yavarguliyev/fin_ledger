export const SUPPORT_PINS_SQL = {
  LIST: `
    SELECT m.id, m.conversation_id AS "conversationId", m.sender_user_id AS "senderUserId", sender.display_name AS "senderName",
           sender.role::text AS "senderRole", m.kind, m.source, m.body, m.storage_key AS "storageKey", m.file_name AS "fileName",
           m.mime_type AS "mimeType", m.size_bytes::int AS "sizeBytes", m.duration_seconds AS "durationSeconds",
           m.edited_at AS "editedAt", m.deleted_at AS "deletedAt", m.created_at AS "createdAt"
      FROM support_pinned_messages p
      JOIN support_messages m ON m.id = p.message_id
      LEFT JOIN users sender ON sender.id = m.sender_user_id
     WHERE p.conversation_id = $1 AND p.expires_at > now() AND m.deleted_at IS NULL
       AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = m.id AND h.user_id = $2)
     ORDER BY p.created_at DESC
  `,
  PIN: `
    INSERT INTO support_pinned_messages (message_id, conversation_id, pinned_by, expires_at)
    SELECT m.id, m.conversation_id, $3, now() + make_interval(secs => $4::int)
      FROM support_messages m
     WHERE m.id = $1 AND m.conversation_id = $2 AND m.deleted_at IS NULL AND m.kind <> 'SYSTEM'
    ON CONFLICT (message_id) DO UPDATE SET pinned_by = EXCLUDED.pinned_by, expires_at = EXCLUDED.expires_at, created_at = now()
    RETURNING message_id AS "messageId"
  `,
  TRIM: `
    DELETE FROM support_pinned_messages
     WHERE conversation_id = $1
       AND (expires_at <= now() OR message_id IN (
         SELECT message_id FROM support_pinned_messages
          WHERE conversation_id = $1 AND expires_at > now()
          ORDER BY created_at DESC
         OFFSET $2
       ))
  `,
  UNPIN: 'DELETE FROM support_pinned_messages WHERE message_id = $1 AND conversation_id = $2'
} as const;
