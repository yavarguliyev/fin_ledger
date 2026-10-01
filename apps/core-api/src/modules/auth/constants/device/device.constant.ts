export const DEVICE = {
  HEADER: 'x-device-id',
  MAX_VISITOR_LENGTH: 128,
  MAX_USER_AGENT_LENGTH: 512,
  SHARED_DEVICE_MIN_ACCOUNTS: 2,
  SHARED_DEVICE_LIMIT: 100,
  EMAIL: {
    SUBJECT: 'A new device signed in to your account',
    PURPOSE: 'New Device',
    TITLE: 'A new device signed in',
    BODY: 'If this was you, there is nothing to do. If it was not, change your password and turn on two-factor authentication.'
  },
  AGGREGATE_TYPE: 'User',
  PROFILE_PATH: '/profile',
  SHARED_SQL: `
    SELECT d.visitor_id AS "visitorId",
           count(DISTINCT d.user_id)::int AS "accountCount",
           array_agg(DISTINCT u.email::text) AS emails,
           max(d.last_seen_at) AS "lastSeenAt"
    FROM user_devices d
    JOIN users u ON u.id = d.user_id
    GROUP BY d.visitor_id
    HAVING count(DISTINCT d.user_id) >= $1
    ORDER BY count(DISTINCT d.user_id) DESC, max(d.last_seen_at) DESC
    LIMIT $2
  `
} as const;
