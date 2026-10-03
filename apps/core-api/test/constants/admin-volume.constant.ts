import { HTTP_STATUS } from './http-status.constant';

export const ADMIN_VOLUME_TEST = {
  ...HTTP_STATUS,
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  OWNER_EMAIL: 'admin-volume@support-tests.realtime-wallet-payments.com',
  WALLETS_PATH: '/wallets',
  DASHBOARD_PATH: '/admin/dashboard',
  CURRENCY: 'GBP',
  PLAYER_ROLE: 'USER',
  VOLUMES_SQL: `SELECT w.currency, SUM(w.available_balance_minor + w.reserved_balance_minor)::float8 AS "amountMinor"
    FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.role = $1 GROUP BY w.currency ORDER BY w.currency`
} as const;
