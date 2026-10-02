export const MFA_POLICY_TEST = {
  STATUS_PATH: '/auth/mfa/status',
  SETUP_PATH: '/auth/mfa/setup',
  ENABLE_PATH: '/auth/mfa/enable',
  DISABLE_PATH: '/auth/mfa/disable',
  RECOVERY_CODES_PATH: '/auth/mfa/recovery-codes',
  LOGIN_PATH: '/auth/login',
  STAFF_EMAIL: 'admin@realtime-wallet-payments.com',
  ADMIN_EMAIL: 'mfa-policy-admin@support-tests.realtime-wallet-payments.com',
  ADMIN_ROLE: 'GLOBAL_ADMIN',
  PLAYER_EMAIL: 'mfa-policy-player@support-tests.realtime-wallet-payments.com',
  WRONG_PASSWORD: 'Wrong#Pass2026',
  RECOVERY_CODE_COUNT: 10,
  OK: 200,
  CREATED: 201,
  FORBIDDEN: 403
} as const;
