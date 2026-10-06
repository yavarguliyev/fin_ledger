export const RABBIT_INBOX_TEST = {
  EMAIL: 'rabbit-inbox@support-tests.realtime-wallet-payments.com',
  ROUTING_KEY: 'wallet.credited',
  EVENT_ID_HEADER: 'x-event-id',
  AMOUNT_MINOR: 424242,
  CURRENCY: 'USD',
  CONTENT_MARKER: '%4242.42 USD%',
  POLL_MS: 250,
  WAIT_MS: 15000,
  SETTLE_MS: 3000,
  COUNT_SQL: `SELECT count(*)::int AS count FROM notifications n JOIN users u ON u.id = n.user_id
               WHERE u.email = $1 AND n.content LIKE $2`,
  CLEAN_SQL: 'DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email = $1)'
} as const;
