export const RATE_LIMITS = {
  TTL_MS: 60_000,
  CLIENT: { NAME: 'default', LIMIT: 120, AUTH_LIMIT: 5 },
  USER: { NAME: 'user', LIMIT: 30 },
  TRACKER: { SEPARATOR: ':', UNKNOWN_CLIENT: 'unknown-client', ANONYMOUS_USER: 'anonymous-user' }
} as const;
