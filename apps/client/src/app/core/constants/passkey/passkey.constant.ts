export const PASSKEY = {
  BASE_PATH: '/auth/passkeys',
  REGISTER_OPTIONS_PATH: '/register/options',
  REGISTER_VERIFY_PATH: '/register/verify',
  LOGIN_OPTIONS_PATH: '/login/options',
  LOGIN_VERIFY_PATH: '/login/verify',
  STEP_UP_OPTIONS_PATH: '/step-up/options',
  STEP_UP_VERIFY_PATH: '/step-up/verify',
  OWNER_BYTES: 16,
  CANCELLED_ERRORS: ['NotAllowedError', 'AbortError'],
  STEP_UP_STATUS: 403,
  LABEL_MAX_LENGTH: 100,
  DEFAULT_LABEL: 'This device',

  LABELS: [
    ['iPhone', 'iPhone'],
    ['iPad', 'iPad'],
    ['Macintosh', 'Mac'],
    ['Android', 'Android device'],
    ['Windows', 'Windows PC'],
    ['Linux', 'Linux PC']
  ]
} as const;
