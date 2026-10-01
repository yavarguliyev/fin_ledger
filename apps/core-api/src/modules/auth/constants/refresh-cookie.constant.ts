export const REFRESH_COOKIE = {
  NAME: 'refresh_token',
  PATH: '/api/v1/auth',
  SAME_SITE: 'lax',
  MAX_AGE_MS: 60 * 60 * 24 * 30 * 1000,
  CLEARED_VALUE: '',
  CLEARED_MAX_AGE_MS: 0,
  TOKEN_FIELD: 'refreshToken',
  REVOKING_PATHS: ['logout', 'logout-all'],
  PAIR_SEPARATOR: ';',
  VALUE_SEPARATOR: '='
} as const;
