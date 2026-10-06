import { HTTP_STATUS } from './http-status.constant';

export const NOTIFICATION_KEYSET_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'keyset-reader@support-tests.realtime-wallet-payments.com',
  PATH: '/notifications',
  COUNT: 5,
  PAGE: 2,
  TITLE_PREFIX: 'Keyset probe ',
  SEED_SQL: `INSERT INTO notifications (user_id, type, title, content, created_at)
             SELECT u.id, 'SYSTEM', 'Keyset probe ' || g, 'probe', now() - make_interval(secs => g)
               FROM users u, generate_series(1, $2::int) g WHERE u.email = $1`,
  CLEAN_SQL: "DELETE FROM notifications WHERE title LIKE 'Keyset probe %'",
  QUERY_SEPARATOR: '?',
  EMPTY: ''
} as const;
