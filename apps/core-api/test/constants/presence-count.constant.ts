export const PRESENCE_COUNT_TEST = {
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  CUSTOMER_EMAIL: 'presence-count@support-tests.realtime-wallet-payments.com',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  PRESENCE_PATH: '/support/presence',
  COUNT_PATH: '/support/presence/count',
  INDEX_KEY: 'presence-index',
  KEY_PREFIX: 'presence:',
  EXTRA_USERS: 120,
  PAGE_SIZE: 100,
  TTL_SECONDS: 60,
  ROLE: 'USER',
  DISPLAY_NAME: 'Count probe',
  EXPIRE_FLAG: 'EX'
} as const;
