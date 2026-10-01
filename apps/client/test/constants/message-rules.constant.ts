export const MESSAGE_RULES_TEST = {
  OWNER: 'user-1',
  OTHER: 'user-2',
  MINUTE_MS: 60 * 1000,
  HOUR_MS: 60 * 60 * 1000,
  FRESH_MINUTES: 5,
  STALE_MINUTES: 16,
  RECENT_HOURS: 47,
  OLD_HOURS: 49,
  TEXT: 'Hello',
  KIND: 'TEXT',
  SOURCE: 'WEB'
} as const;
