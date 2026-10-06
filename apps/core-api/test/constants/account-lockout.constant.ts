import { HTTP_STATUS } from './http-status.constant';

export const LOCKOUT_TEST = {
  ...HTTP_STATUS,
  LOGIN_PATH: '/auth/login',
  REGISTER_PATH: '/auth/register',
  VERIFY_EMAIL_PATH: '/auth/verify-email',
  EMAIL: 'lockout@integration.test',
  DISPLAY_NAME: 'Lock Out',
  PASSWORD: 'Lockout#Pass2026',
  WRONG_PASSWORD: 'Lockout#Wrong2026',
  MAX_ATTEMPTS: 5,
  FIRST_FAILURE: 1,
  INVALID_MESSAGE: 'Invalid credentials',
  CLEARED_ATTEMPTS: 0,
  STATE_SQL: 'SELECT failed_login_attempts AS attempts, (locked_until > now()) AS locked FROM users WHERE email = $1',
  EXPIRE_LOCK_SQL: "UPDATE users SET locked_until = now() - interval '1 minute' WHERE email = $1"
} as const;
