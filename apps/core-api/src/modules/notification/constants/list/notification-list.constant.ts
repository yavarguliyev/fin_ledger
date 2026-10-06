export const NOTIFICATION_LIST = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  CURSOR_MESSAGE: 'Pass both before and beforeId, or neither',
  KEYSET_SQL: `
    SELECT id, user_id AS "userId", channel, type, title, content, data, status,
           sent_at AS "sentAt", read_at AS "readAt", to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt",
           updated_at AS "updatedAt"
      FROM notifications
     WHERE user_id = $1
       AND ($2::timestamptz IS NULL OR (created_at, id) < ($2::timestamptz, $3::uuid))
     ORDER BY created_at DESC, id DESC
     LIMIT $4
  `
} as const;
