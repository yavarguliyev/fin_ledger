import { HTTP_STATUS } from './http-status.constant';

export const ADMIN_USER_KEYSET_TEST = {
  ...HTTP_STATUS,
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  USERS_PATH: '/admin/users',
  DASHBOARD_PATH: '/admin/dashboard',
  PAGE: 2,
  QUERY_SEPARATOR: '?',
  EMPTY: '',
  PLAYER_IDS_SQL: "SELECT id FROM users WHERE role = 'USER' ORDER BY created_at DESC, id DESC",
  COUNTS_SQL: `SELECT (SELECT COUNT(*) FROM users WHERE role = 'USER')::int AS total,
    (SELECT COUNT(*) FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.role = 'USER' AND w.status = 'ACTIVE')::int AS active`
} as const;
