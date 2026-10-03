export const RETENTION_HISTORY_TEST = {
  NOTIFICATION_DAYS: 90,
  LOGIN_EVENT_DAYS: 365,
  PAST_WINDOW_DAYS: 30,
  WORKER_ROLE: 'app_worker',
  TABLES: ['notifications', 'login_events'],
  DELETE: 'DELETE',
  ANY_USER_SQL: 'SELECT id FROM users LIMIT 1',
  NOTIFICATION_SQL: `INSERT INTO notifications (user_id, type, title, content, status, created_at, read_at, sent_at)
                     VALUES ($1, 'SYSTEM', 'retention probe', 'probe', $2, now() - make_interval(days => $3),
                             CASE WHEN $2 = 'READ' THEN now() - make_interval(days => $3) END,
                             CASE WHEN $2 = 'READ' THEN now() - make_interval(days => $3) END) RETURNING id`,
  LOGIN_SQL: "INSERT INTO login_events (user_id, ip, created_at) VALUES ($1, '10.0.0.9', now() - make_interval(days => $2)) RETURNING id",
  EXISTS_NOTIFICATIONS_SQL: 'SELECT id FROM notifications WHERE id = ANY($1)',
  EXISTS_LOGINS_SQL: 'SELECT id FROM login_events WHERE id = ANY($1)',
  PRIVILEGE_SQL: 'SELECT has_table_privilege($1, $2, $3) AS allowed',
  READ: 'READ',
  UNREAD: 'PENDING'
} as const;
