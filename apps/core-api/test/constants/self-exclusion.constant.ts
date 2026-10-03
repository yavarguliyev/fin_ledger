import { HTTP_STATUS } from './http-status.constant';

export const SELF_EXCLUSION_TEST = {
  ...HTTP_STATUS,
  PATH: '/users/me/self-exclusion',
  BETS_PATH: '/bets',
  DEPOSIT_PATH: '/payments/deposit',
  WITHDRAW_PATH: '/payments/withdraw',
  ME_PATH: '/users/me',
  USERS_PATH: '/users',
  REGISTER_PATH: '/auth/register',
  VERIFY_EMAIL_PATH: '/auth/verify-email',
  EMAIL: 'self-excluded@integration.test',
  DISPLAY_NAME: 'Self Excluded',
  PASSWORD: 'Exclude#Pass2026',
  SHORT_PERIOD: 'DAY_1',
  LONG_PERIOD: 'DAYS_30',
  PERMANENT_PERIOD: 'PERMANENT',
  STAKE_MINOR: 100,
  AMOUNT_MINOR: 2500,
  CURRENCY: 'USD',
  SELECTION: 'Home',
  BLOCKED_MESSAGE: 'You have self-excluded from gambling. This cannot be lifted before it expires.'
} as const;
