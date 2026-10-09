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
           customer.profile_images ->> customer.profile_image_index AS "customerAvatarKey",
           c.assigned_staff_id AS "assignedStaffId",
           staff.display_name AS "assignedStaffName",
           staff.profile_images ->> staff.profile_image_index AS "assignedStaffAvatarKey",
           c.subject,
           c.status,
           to_char(c.last_message_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "lastMessageAt",
           c.created_at AS "createdAt",
           (
             SELECT count(*)::int FROM support_messages m
             WHERE m.conversation_id = c.id
               AND m.deleted_at IS NULL
               AND m.sender_user_id IS DISTINCT FROM $1
               AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at)
           ) AS "unreadCount",
           CASE WHEN c.privacy_enabled OR chat_lock.user_id IS NOT NULL OR last_message.deleted_at IS NOT NULL THEN NULL
                WHEN last_message.kind IN ('IMAGE', 'VIDEO', 'VOICE') THEN nullif(last_message.body, '')
                ELSE coalesce(nullif(last_message.body, ''), last_message.file_name) END AS "lastMessagePreview",
           last_message.sender_user_id AS "lastMessageSenderId",
           last_message.kind AS "lastMessageKind",
           coalesce(last_message.seen, false) AS "lastMessageSeen",
           coalesce(last_message.deleted_at IS NOT NULL, false) AS "lastMessageDeleted",
           c.privacy_enabled AS "privacyEnabled",
           chat_lock.user_id IS NOT NULL AS "locked",
           coalesce(pref.muted_until > now(), false) AS "muted",
           CASE WHEN pref.muted_until > now() AND isfinite(pref.muted_until)
                THEN to_char(pref.muted_until AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END AS "mutedUntil",
           to_char(pref.pinned_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "pinnedAt",
           coalesce(pref.favourite, false) AS "favourite",
           c.theme AS "theme"
      FROM support_conversations c
      LEFT JOIN users customer ON customer.id = c.customer_user_id
      LEFT JOIN users staff ON staff.id = c.assigned_staff_id
      LEFT JOIN support_read_receipts r ON r.conversation_id = c.id AND r.user_id = $1
      LEFT JOIN support_conversation_locks chat_lock ON chat_lock.conversation_id = c.id AND chat_lock.user_id = $1
      LEFT JOIN support_conversation_preferences pref ON pref.conversation_id = c.id AND pref.user_id = $1
      LEFT JOIN LATERAL (
        SELECT lm.sender_user_id, lm.kind, lm.body, lm.file_name, lm.deleted_at,
               EXISTS (
                 SELECT 1 FROM support_read_receipts rr
                  WHERE rr.conversation_id = c.id AND rr.user_id IS DISTINCT FROM lm.sender_user_id AND rr.last_read_at >= lm.created_at
               ) AS seen
          FROM support_messages lm
         WHERE lm.conversation_id = c.id
           AND NOT EXISTS (SELECT 1 FROM support_hidden_messages h WHERE h.message_id = lm.id AND h.user_id = $1)
         ORDER BY lm.created_at DESC
         LIMIT 1
      ) last_message ON true
     WHERE (c.customer_user_id = $1 OR c.assigned_staff_id = $1 OR (c.assigned_staff_id IS NULL AND $4::boolean))
       AND ($3::timestamptz IS NULL OR (c.last_message_at, c.id) < ($3::timestamptz, $5::uuid))
     ORDER BY c.last_message_at DESC, c.id DESC
     LIMIT $2
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
