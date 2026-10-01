export const HEALTH = {
  TAG: 'health',
  LIVE_PATH: 'live',
  READY_PATH: 'ready',
  OK: 'ok',
  DATABASE_KEY: 'database',
  PING_SQL: 'SELECT 1',
  REDIS_KEY: 'redis',
  BROKER_KEY: 'broker',
  PROBE_KEY: 'health:probe',
  PROBE_TTL_SECONDS: 5,
  BROKER_PROBE_EVENT: 'wallet.credited'
} as const;
