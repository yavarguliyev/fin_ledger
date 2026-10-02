export const REDIS_DEFAULTS = {
  HOST: 'localhost',
  PORT: 6379,
  DB: 0,
  SENTINEL_MASTER_NAME: 'mymaster',
  SCAN_BATCH_SIZE: 100,
  MIN_SCORE: '-inf',
  MAX_SCORE: '+inf',
  LIMIT: 'LIMIT'
} as const;
