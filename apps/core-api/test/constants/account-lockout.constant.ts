export const LOCKOUT_TEST = {
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
  CREATED: 201,
  UNAUTHORIZED: 401
} as const;
