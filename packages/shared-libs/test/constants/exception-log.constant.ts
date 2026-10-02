export const EXCEPTION_LOG_SPEC = {
  CORRELATION_ID: 'corr-1',
  METHOD: 'POST',
  URL: '/api/v1/auth/refresh',
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500,
  DEBUG: 'debug',
  WARN: 'warn',
  ERROR: 'error',
  EXPIRED: 'Refresh token is invalid or has expired.',
  BROKEN: 'database exploded'
} as const;
