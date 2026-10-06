import { HTTP_STATUS } from './http-status.constant';

export const LEDGER_INTEGRITY_TEST = {
  ...HTTP_STATUS,
  PLAYER_EMAIL: 'player19@realtime-wallet-payments.com',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  PATH: '/ledgers/integrity',
  GET: 'GET',
  DRIFT: 1,
  SHIFT_SQL: 'UPDATE wallets SET available_balance_minor = available_balance_minor + $2 WHERE user_id = (SELECT id FROM users WHERE email = $1)',
  HEALTHY_REPORT: { driftedAccounts: 0, driftedWallets: 0, unbalancedCurrencies: [], healthy: true },
  DRIFTED_REPORT: { driftedWallets: 1, healthy: false },
  HEALTHY: { healthy: true }
} as const;
