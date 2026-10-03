import { HTTP_STATUS } from './http-status.constant';

export const BUSINESS_METRICS_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'player15@realtime-wallet-payments.com',
  METRICS_PATH: '/metrics',
  API_SUFFIX: /\/api\/v\d+$/,
  CREATED_DEPOSITS: /^core_api_payments_last_minute\{type="DEPOSIT",outcome="created"\} (\d+)$/m,
  BETS_PLACED: /^core_api_bets_last_minute\{outcome="placed"\} (\d+)$/m,
  WALLET_SQL: 'SELECT id, currency FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = $1) LIMIT 1',
  PAYMENT_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, type, amount_minor, currency, status, provider)
                VALUES ($1, (SELECT id FROM users WHERE email = $2), $3, 'DEPOSIT', 2500, $4, 'PENDING', 'stripe') RETURNING id`,
  CLEANUP_SQL: 'DELETE FROM payments WHERE id = $1'
} as const;
