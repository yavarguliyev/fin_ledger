export const PRESENCE = {
  KEY_PREFIX: 'presence:',
  LAST_SEEN_PREFIX: 'presence-last:',
  LAST_SEEN_TTL_SECONDS: 2592000,
  SCAN_PATTERN: 'presence:*',
  ONLINE_TTL_SECONDS: 60,
  AWAY_AFTER_SECONDS: 25,
  HEARTBEAT_MS: 20000
} as const;
