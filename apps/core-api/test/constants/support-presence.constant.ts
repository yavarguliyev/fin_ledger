import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_PRESENCE_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'presence-customer@support-tests.realtime-wallet-payments.com',
  OTHER_EMAIL: 'presence-other@support-tests.realtime-wallet-payments.com',
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  PRESENCE_PATH: '/support/presence',
  LEAVE_PATH: '/support/presence/leave',
  LAST_SEEN_PATH: '/support/presence/last-seen',
  STAFF_ROLE: 'MODERATOR',
  USER_ROLE: 'USER',
  ONLINE: 'ONLINE'
} as const;
