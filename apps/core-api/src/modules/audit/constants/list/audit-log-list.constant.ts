export const AUDIT_LOG_LIST = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  CURSOR_MESSAGE: 'Pass both before and beforeId, or neither',
  KEYSET_SQL: `
    SELECT id, actor_user_id AS "actorUserId", actor_role AS "actorRole", actor_service AS "actorService", action,
           entity_type AS "entityType", entity_id AS "entityId", before_state AS "beforeState", after_state AS "afterState",
           host(ip_address) AS "ipAddress", user_agent AS "userAgent", request_id AS "requestId",
           to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
      FROM audit_log
     WHERE ($1::text IS NULL OR action = $1)
       AND ($2::text IS NULL OR entity_type = $2)
       AND ($3::uuid IS NULL OR entity_id = $3)
       AND ($4::uuid IS NULL OR actor_user_id = $4)
       AND ($5::timestamptz IS NULL OR (created_at, id) < ($5::timestamptz, $6::uuid))
     ORDER BY created_at DESC, id DESC
     LIMIT $7
  `
} as const;
