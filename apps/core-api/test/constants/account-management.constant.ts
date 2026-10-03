import { HTTP_STATUS } from './http-status.constant';

export const ACCOUNT_MANAGEMENT = {
  ...HTTP_STATUS,
  REGISTER_PATH: '/auth/register',
  LOGIN_PATH: '/auth/login',
  VERIFY_EMAIL_PATH: '/auth/verify-email',
  CHANGE_PASSWORD_PATH: '/auth/change-password',
  CHANGE_EMAIL_PATH: '/auth/change-email',
  CONFIRM_EMAIL_CHANGE_PATH: '/auth/confirm-email-change',
  WALLETS_PATH: '/wallets',
  EMAIL: 'account-owner@integration.test',
  NEW_EMAIL: 'account-moved@integration.test',
  TAKEN_EMAIL: 'player3@realtime-wallet-payments.com',
  DISPLAY_NAME: 'Account Owner',
  PASSWORD: 'Account#Pass2026',
  NEW_PASSWORD: 'Account#Pass2027',
  WRONG_PASSWORD: 'Account#Wrong2026'
} as const;
