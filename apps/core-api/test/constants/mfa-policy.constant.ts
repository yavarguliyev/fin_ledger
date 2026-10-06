import { HTTP_STATUS } from './http-status.constant';

export const MFA_POLICY_TEST = {
  ...HTTP_STATUS,
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
  POST: 'POST',
  EMPTY: '',
  SECRET_PARAM: 'secret',
  ACTIVE_CODES_SQL:
    'SELECT count(*)::text AS active FROM mfa_recovery_codes c JOIN users u ON u.id = c.user_id WHERE u.email = $1 AND c.used_at IS NULL'
} as const;
