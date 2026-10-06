import { HTTP_STATUS } from './http-status.constant';

export const WALLET_OVERVIEW_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'player1@realtime-wallet-payments.com',
  OTHER_EMAIL: 'player2@realtime-wallet-payments.com',
  BASE_PATH: '/wallet-transactions/',
  OVERVIEW: '/overview?page=1&limit=5',
  TRANSACTIONS: '/transactions?page=1&limit=5',
  SUMMARY: '/summary',
  WALLET_SQL: 'SELECT w.id FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1 ORDER BY w.created_at LIMIT 1',
  EMPTY: ''
} as const;
