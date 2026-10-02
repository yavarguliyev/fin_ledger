export const PRESENCE_INDEX_TEST = {
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  LEAVER_EMAIL: 'presence-leaver@support-tests.realtime-wallet-payments.com',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  PRESENCE_PATH: '/support/presence',
  LEAVE_PATH: '/support/presence/leave',
  USER_ID_SQL: 'SELECT id FROM users WHERE email = $1',
  INDEX_KEY: 'presence-index',
  KEY_PREFIX: 'presence:',
  EXTRA_USERS: 40,
  TTL_SECONDS: 60,
  ROLE: 'USER',
  DISPLAY_NAME: 'Load probe',
  COMMANDSTATS: 'commandstats',
  CALLS_PATTERN: (command: string): RegExp => new RegExp(`cmdstat_${command}:calls=(\\d+)`),
  COMMANDS: ['scan', 'get', 'mget', 'zrangebyscore'],
  EXPECTED_CALLS: { scan: 0, mget: 1, zrangebyscore: 1 },
  OK: 200
} as const;
