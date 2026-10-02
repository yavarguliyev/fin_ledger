export const EXCEPTION_LOG_DEFAULTS = {
  METHOD: 'UNKNOWN',
  URL: 'unknown',
  TYPE: 'UnknownError',
  TYPE_SEPARATOR: ': ',
  QUIET_STATUSES: [401, 403] as readonly number[],
  LEVELS: { DEBUG: 'debug', WARN: 'warn', ERROR: 'error' }
} as const;
