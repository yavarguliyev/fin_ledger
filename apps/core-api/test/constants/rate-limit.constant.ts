import { HTTP_STATUS } from './http-status.constant';

export const RATE_LIMIT = {
  ...HTTP_STATUS,
  FIRST_EMAIL: 'player20@realtime-wallet-payments.com',
  SECOND_EMAIL: 'player21@realtime-wallet-payments.com',
  USERS: ['player20@realtime-wallet-payments.com', 'player21@realtime-wallet-payments.com'],
  WRONG_PASSWORD: 'Wrong#Pass2026',
  LOGIN_PATH: '/auth/login',
  REFRESH_PATH: '/auth/refresh',
  DEPOSIT_PATH: '/payments/deposit',
  WALLETS_PATH: '/wallets',
  LOGIN_ATTEMPTS: 5,
  MONEY_ATTEMPTS: 30,
  BLOCKED_CODE: 'HTTP_429',
  RETRY_AFTER_HEADER: 'retry-after',
  FORWARDED_HEADER: 'X-Forwarded-For',
  JSON_TYPE: 'application/json',
  EMPTY_JSON: '{}'
} as const;
