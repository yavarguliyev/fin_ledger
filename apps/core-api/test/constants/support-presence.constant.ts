export const SUPPORT_PRESENCE_TEST = {
  CUSTOMER_EMAIL: 'player2@realtime-wallet-payments.com',
  OTHER_EMAIL: 'player17@realtime-wallet-payments.com',
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  PRESENCE_PATH: '/support/presence',
  LEAVE_PATH: '/support/presence/leave',
  LAST_SEEN_PATH: '/support/presence/last-seen',
  FORBIDDEN: 403,
  STAFF_ROLE: 'MODERATOR',
  USER_ROLE: 'USER',
  ONLINE: 'ONLINE',
  OK: 200,
  CREATED: 201
} as const;
