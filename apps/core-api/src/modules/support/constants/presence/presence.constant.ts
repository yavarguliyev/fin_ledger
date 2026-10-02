export const PRESENCE = {
  KEY_PREFIX: 'presence:',
  LAST_SEEN_PREFIX: 'presence-last:',
  LAST_SEEN_TTL_SECONDS: 2592000,
  INDEX_KEY: 'presence-index',
  STAFF_INDEX_KEY: 'presence-index:staff',
  PAGE_SIZE: 100,
  SELF_ENTRY: 1,
  NO_ENTRIES: 0,
  SWEEP_LOCK_KEY: 'presence-sweep-lock',
  SWEEP_LOCK_SECONDS: 10,
  SWEEP_LOCK_VALUE: 1,
  UNKNOWN: '',
  MS_PER_SECOND: 1000,
  ONLINE_TTL_SECONDS: 60,
  AWAY_AFTER_SECONDS: 25,
  HEARTBEAT_MS: 20000
} as const;
