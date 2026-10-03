import { HTTP_STATUS } from './http-status.constant';

export const DEPOSIT_LIMITS_TEST = {
  ...HTTP_STATUS,
  LIMITS_PATH: '/users/me/deposit-limits',
  DEPOSIT_PATH: '/payments/deposit',
  REGISTER_PATH: '/auth/register',
  VERIFY_EMAIL_PATH: '/auth/verify-email',
  EMAIL: 'deposit-limited@integration.test',
  DISPLAY_NAME: 'Deposit Limited',
  PASSWORD: 'Limited#Pass2026',
  CURRENCY: 'USD',
  DAILY: 'DAILY',
  LIMIT_MINOR: 10_000,
  RAISED_MINOR: 50_000,
  LOWERED_MINOR: 5_000,
  UNDER_LIMIT_MINOR: 4_000,
  ALREADY_SPENT_MINOR: 9_000,
  WITHIN_LIMIT_MINOR: 500,
  SEED_SQL: `
    INSERT INTO payments (idempotency_key, user_id, wallet_id, currency, type, status, amount_minor, provider)
    SELECT 'limit-seed', u.id, w.id, $2, 'DEPOSIT', 'PENDING', $3, 'stripe'
    FROM users u JOIN wallets w ON w.user_id = u.id
    WHERE u.email = $1
  `
} as const;
