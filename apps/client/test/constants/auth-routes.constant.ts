export const AUTH_ROUTES_SPEC = {
  BASE: 'http://localhost:3000/api/v1',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PASSKEY_LOGIN_OPTIONS: '/auth/passkeys/login/options',
  PASSKEY_LOGIN_VERIFY: '/auth/passkeys/login/verify',
  PASSKEY_LIST: '/auth/passkeys',
  PASSKEY_STEP_UP: '/auth/passkeys/step-up/options',
  MFA_VERIFY: '/auth/mfa/verify',
  MFA_STATUS: '/auth/mfa/status',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logout-all',
  USERS_ME: '/users/me',
  SUPPORT_STREAM: '/support/stream'
} as const;
