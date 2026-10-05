import { HTTP_STATUS } from './http-status.constant';

export const PAYMENT_IDEMPOTENCY = {
  ...HTTP_STATUS,
  PLAYERS: ['player7@realtime-wallet-payments.com', 'player8@realtime-wallet-payments.com'],
  METHOD_PREFIX: 'pm_integration_',
  DEPOSIT_PATH: '/payments/deposit',
  DEPOSIT_MINOR: 1500,
  CURRENCY: 'USD',
  SHARED_KEY: 'shared-client-key',
  TWO_PAYMENTS: [{ count: 2 }],
  NO_DRIFT: [{ count: 0 }],
  METHOD_SQL: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
               SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', $2, display_name, '4242', 'visa', 12, 2034, true, now() FROM users WHERE email = $1 RETURNING id`,
  COUNT_BY_KEY_SQL: 'SELECT count(*)::int AS count FROM payments WHERE idempotency_key = $1',
  WALLET_DRIFT_SQL: 'SELECT count(*)::int AS count FROM v_wallet_ledger_drift',
  LEDGER_DRIFT_SQL: 'SELECT count(*)::int AS count FROM v_ledger_balance_drift'
} as const;
