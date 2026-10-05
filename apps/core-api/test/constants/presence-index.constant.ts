import { HTTP_STATUS } from './http-status.constant';

export const PRESENCE_INDEX_TEST = {
  ...HTTP_STATUS,
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  LEAVER_EMAIL: 'presence-leaver@support-tests.realtime-wallet-payments.com',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  PRESENCE_PATH: '/support/presence',
  LEAVE_PATH: '/support/presence/leave',
  INDEX_KEY: 'presence-index',
  EXTRA_USERS: 40,
  DISPLAY_NAME: 'Load probe',
  COMMANDSTATS: 'commandstats',
  CALLS_PATTERN: (command: string): RegExp => new RegExp(`cmdstat_${command}:calls=(\\d+)`),
  COMMANDS: ['scan', 'get', 'mget', 'zrevrangebyscore'],
  EXPECTED_CALLS: { scan: 0, mget: 1, zrevrangebyscore: 1 }
} as const;
