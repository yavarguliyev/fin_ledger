import { MESSAGE_REACTION } from './message-reaction.constant';

export const SUPPORT_SQL = {
  OPEN_OR_CREATE: `
    WITH existing AS (
      SELECT id FROM support_conversations WHERE customer_user_id = $1 AND assigned_staff_id = $3 AND status = 'OPEN'
    ), created AS (
      INSERT INTO support_conversations (customer_user_id, subject, assigned_staff_id)
      SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM existing)
      RETURNING id
    )
    SELECT id FROM existing UNION ALL SELECT id FROM created
  `,
  LIST_CONVERSATIONS: `
    SELECT c.id,
           c.customer_user_id AS "customerUserId",
           customer.display_name AS "customerName",
           c.assigned_staff_id AS "assignedStaffId",
           staff.display_name AS "assignedStaffName",
           c.subject,
           c.status,
           c.last_message_at AS "lastMessageAt",
           c.created_at AS "createdAt",
           (
             SELECT count(*)::int FROM support_messages m
             WHERE m.conversation_id = c.id
               AND m.deleted_at IS NULL
               AND m.sender_user_id IS DISTINCT FROM $1
               AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at)
           ) AS "unreadCount",
           (
             SELECT CASE WHEN m.body IS NOT NULL THEN m.body ELSE m.file_name END
               FROM support_messages m
              WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
              ORDER BY m.created_at DESC LIMIT 1
           ) AS "lastMessagePreview"
      FROM support_conversations c
      LEFT JOIN users customer ON customer.id = c.customer_user_id
      LEFT JOIN users staff ON staff.id = c.assigned_staff_id
      LEFT JOIN support_read_receipts r ON r.conversation_id = c.id AND r.user_id = $1
     WHERE c.customer_user_id = $1 OR c.assigned_staff_id = $1 OR (c.assigned_staff_id IS NULL AND $4::boolean)
     ORDER BY c.last_message_at DESC
     LIMIT $2 OFFSET $3
  `,
  LIST_MESSAGES: `
    SELECT m.id,
           m.conversation_id AS "conversationId",
           m.sender_user_id AS "senderUserId",
           sender.display_name AS "senderName",
           sender.role::text AS "senderRole",
           m.kind,
           m.source,
           m.body,
           m.storage_key AS "storageKey",
           m.file_name AS "fileName",
           m.mime_type AS "mimeType",
           m.size_bytes::int AS "sizeBytes",
           m.duration_seconds AS "durationSeconds",
           m.edited_at AS "editedAt",
           m.deleted_at AS "deletedAt",
           m.created_at AS "createdAt",
           m.reply_to_message_id AS "replyToMessageId",
           reply.sender_user_id AS "replyToSenderUserId",
           reply_sender.display_name AS "replyToSenderName",
           CASE WHEN reply.deleted_at IS NULL THEN reply.body END AS "replyToBody",
           reply.kind AS "replyToKind",
           reply.deleted_at IS NOT NULL AS "replyToDeleted",
           ${MESSAGE_REACTION.AGGREGATE_COLUMN},
           EXISTS (
             SELECT 1 FROM support_read_receipts r
              WHERE r.conversation_id = m.conversation_id
                AND r.user_id IS DISTINCT FROM m.sender_user_id
                AND r.last_read_at >= m.created_at
           ) AS "seen"
      FROM support_messages m
      LEFT JOIN users sender ON sender.id = m.sender_user_id
      LEFT JOIN support_messages reply ON reply.id = m.reply_to_message_id
      LEFT JOIN users reply_sender ON reply_sender.id = reply.sender_user_id
     WHERE m.conversation_id = $1
       AND ($2::timestamptz IS NULL OR m.created_at < $2::timestamptz)
       AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = m.id AND h.user_id = $4)
     ORDER BY m.created_at DESC
     LIMIT $3
  `,
  TOUCH_CONVERSATION: `
    UPDATE support_conversations
       SET last_message_at = now(), updated_at = now()
     WHERE id = $1
  `,
  MARK_READ: `
    INSERT INTO support_read_receipts (conversation_id, user_id, last_read_message_id, last_read_at, updated_at)
    VALUES ($1, $2, $3, now(), now())
    ON CONFLICT (conversation_id, user_id)
    DO UPDATE SET last_read_message_id = EXCLUDED.last_read_message_id, last_read_at = now(), updated_at = now()
  `,
  ASSIGN_STAFF: `
    UPDATE support_conversations
       SET assigned_staff_id = COALESCE(assigned_staff_id, $2), updated_at = now()
     WHERE id = $1 AND status = 'OPEN'
  `
} as const;
