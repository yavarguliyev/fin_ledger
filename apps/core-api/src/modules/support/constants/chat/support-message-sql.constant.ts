export const SUPPORT_MESSAGE_SQL = {
  INSERT_ATTACHMENT: `
    INSERT INTO support_messages (conversation_id, sender_user_id, kind, source, body, storage_key, file_name, mime_type, size_bytes, duration_seconds)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, conversation_id AS "conversationId", sender_user_id AS "senderUserId", kind, source, body,
              storage_key AS "storageKey", file_name AS "fileName", mime_type AS "mimeType", size_bytes::int AS "sizeBytes",
              duration_seconds AS "durationSeconds", edited_at AS "editedAt", deleted_at AS "deletedAt", created_at AS "createdAt"
  `,
  EDIT: `
    UPDATE support_messages
       SET body = $2,
           storage_key = COALESCE($3, storage_key),
           file_name = COALESCE($4, file_name),
           mime_type = COALESCE($5, mime_type),
           size_bytes = COALESCE($6, size_bytes),
           kind = COALESCE($7, kind),
           edited_at = now()
     WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, conversation_id AS "conversationId", sender_user_id AS "senderUserId", kind, source, body,
              storage_key AS "storageKey", file_name AS "fileName", mime_type AS "mimeType", size_bytes::int AS "sizeBytes",
              duration_seconds AS "durationSeconds", edited_at AS "editedAt", deleted_at AS "deletedAt", created_at AS "createdAt"
  `,
  DELETE_FOR_EVERYONE: `
    UPDATE support_messages
       SET body = NULL, storage_key = NULL, file_name = NULL, mime_type = NULL, size_bytes = NULL, duration_seconds = NULL, deleted_at = now()
     WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, conversation_id AS "conversationId", sender_user_id AS "senderUserId", kind, source, body,
              storage_key AS "storageKey", file_name AS "fileName", mime_type AS "mimeType", size_bytes::int AS "sizeBytes",
              duration_seconds AS "durationSeconds", edited_at AS "editedAt", deleted_at AS "deletedAt", created_at AS "createdAt"
  `,
  HIDE_FOR_USER: `
    INSERT INTO support_hidden_messages (message_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (message_id, user_id) DO NOTHING
  `
} as const;
