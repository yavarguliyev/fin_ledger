export const RATE_LIMITS = {
  TTL_MS: 60_000,
  CLIENT: { NAME: 'default', LIMIT: 120, AUTH_LIMIT: 5, REFRESH_LIMIT: 30 },
  USER: { NAME: 'user', LIMIT: 30, CHAT_LIMIT: 120 },
  TRACKER: { SEPARATOR: ':', UNKNOWN_CLIENT: 'unknown-client', ANONYMOUS_USER: 'anonymous-user', NO_SESSION: 'no-session', SESSION_FIELD: 'refreshToken' }
} as const;
