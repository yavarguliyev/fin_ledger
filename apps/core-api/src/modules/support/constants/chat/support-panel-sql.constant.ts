export const SUPPORT_PANEL_SQL = {
  FILES: `
    SELECT m.id, m.conversation_id AS "conversationId", m.sender_user_id AS "senderUserId", m.kind, m.source, m.body,
           m.storage_key AS "storageKey", m.file_name AS "fileName", m.mime_type AS "mimeType", m.size_bytes::int AS "sizeBytes",
           m.duration_seconds AS "durationSeconds", m.edited_at AS "editedAt", m.deleted_at AS "deletedAt", m.created_at AS "createdAt",
           sender.display_name AS "senderName", sender.role::text AS "senderRole"
      FROM support_messages m
      LEFT JOIN users sender ON sender.id = m.sender_user_id
     WHERE m.conversation_id = $1
       AND m.kind = ANY($2::text[])
       AND m.storage_key IS NOT NULL
       AND m.deleted_at IS NULL
       AND ($3::timestamptz IS NULL OR (m.created_at, m.id) < ($3::timestamptz, $4::uuid))
       AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = m.id AND h.user_id = $6)
     ORDER BY m.created_at DESC, m.id DESC
     LIMIT $5
  `,
  LINKS: `
    SELECT l.id, l.message_id AS "messageId", l.url, m.body, sender.display_name AS "senderName", l.created_at AS "createdAt"
      FROM support_message_links l
      JOIN support_messages m ON m.id = l.message_id
      LEFT JOIN users sender ON sender.id = m.sender_user_id
     WHERE l.conversation_id = $1
       AND m.deleted_at IS NULL
       AND ($2::timestamptz IS NULL OR (l.created_at, l.id) < ($2::timestamptz, $3::uuid))
       AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = l.message_id AND h.user_id = $5)
     ORDER BY l.created_at DESC, l.id DESC
     LIMIT $4
  `,
  STORAGE_TOTALS: `
    SELECT coalesce(sum(m.size_bytes), 0)::float8 AS "totalBytes",
           coalesce(sum(m.size_bytes) FILTER (WHERE m.sender_user_id = $2), 0)::float8 AS "ownBytes",
           count(*)::int AS "fileCount"
      FROM support_messages m
     WHERE m.conversation_id = $1
       AND m.storage_key IS NOT NULL
       AND m.deleted_at IS NULL
       AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = m.id AND h.user_id = $2)
  `,
  STORAGE_FILES: `
    SELECT m.id AS "messageId", m.kind, m.file_name AS "fileName", m.mime_type AS "mimeType", m.size_bytes::float8 AS "sizeBytes",
           m.created_at AS "createdAt", m.sender_user_id = $2 AS mine
      FROM support_messages m
     WHERE m.conversation_id = $1
       AND m.storage_key IS NOT NULL
       AND m.deleted_at IS NULL
       AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = m.id AND h.user_id = $2)
     ORDER BY m.size_bytes DESC, m.created_at DESC
     LIMIT $3
  `,
  CUSTOMER_TOTAL: `
    SELECT coalesce(sum(m.size_bytes), 0)::float8 AS "totalBytes"
      FROM support_messages m
      JOIN support_conversations c ON c.id = m.conversation_id
     WHERE c.customer_user_id = $1 AND m.storage_key IS NOT NULL AND m.deleted_at IS NULL
  `,
  DELETE_OWN_FILES: `
    WITH target AS (
      SELECT id, storage_key
        FROM support_messages
       WHERE conversation_id = $1 AND sender_user_id = $2 AND id = ANY($3::uuid[])
         AND storage_key IS NOT NULL AND deleted_at IS NULL
       FOR UPDATE
    )
    UPDATE support_messages m
       SET body = NULL, storage_key = NULL, file_name = NULL, mime_type = NULL, size_bytes = NULL, duration_seconds = NULL, deleted_at = now()
      FROM target
     WHERE m.id = target.id
    RETURNING m.id, m.conversation_id AS "conversationId", m.sender_user_id AS "senderUserId", m.kind, m.source, m.body,
              m.storage_key AS "storageKey", m.file_name AS "fileName", m.mime_type AS "mimeType", m.size_bytes::int AS "sizeBytes",
              m.duration_seconds AS "durationSeconds", m.edited_at AS "editedAt", m.deleted_at AS "deletedAt", m.created_at AS "createdAt",
              target.storage_key AS "removedKey"
  `
} as const;
