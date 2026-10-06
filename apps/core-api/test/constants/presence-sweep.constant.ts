import { HTTP_STATUS } from './http-status.constant';

export const PRESENCE_SWEEP_TEST = {
  ...HTTP_STATUS,
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  PLAYER_EMAIL: 'presence-sweep@support-tests.realtime-wallet-payments.com',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  PRESENCE_PATH: '/support/presence',
  INDEX_KEY: 'presence-index',
  STAFF_INDEX_KEY: 'presence-index:staff',
  SWEEP_LOCK_KEY: 'presence-sweep-lock',
  STALE_AGE_MS: 120_000,
  POST: 'POST',
  EMPTY: ''
} as const;
