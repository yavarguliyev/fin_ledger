import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_CONVERSATION_KEYSET_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'conversation-keyset@support-tests.realtime-wallet-payments.com',
  PATH: '/support/conversations',
  COUNT: 5,
  PAGE: 2,
  QUERY_SEPARATOR: '?',
  EMPTY: '',
  SEED_SQL: `INSERT INTO support_conversations (customer_user_id, subject, status, last_message_at)
             SELECT u.id, 'Keyset probe ' || g, 'CLOSED', date_trunc('second', now()) - make_interval(secs => g / 2)
               FROM users u, generate_series(1, $2::int) g WHERE u.email = $1`,
  IDS_SQL: `SELECT c.id FROM support_conversations c JOIN users u ON u.id = c.customer_user_id
             WHERE u.email = $1 ORDER BY date_trunc('milliseconds', c.last_message_at) DESC, c.id DESC`,
  CLEAN_SQL: 'DELETE FROM support_conversations WHERE customer_user_id IN (SELECT id FROM users WHERE email = $1)'
} as const;
