export const STREAM_METRICS_TEST = {
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  ARRIVING_EMAIL: 'stream-metrics@support-tests.realtime-wallet-payments.com',
  TICKET_PATH: '/support/stream-ticket',
  STREAM_PATH: '/support/stream?ticket=',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  METRICS_PATH: '/metrics',
  API_SUFFIX: /\/api\/v\d+$/,
  STREAM_SERIES: 'route="/api/v1/support/stream",',
  TICKET_SERIES: 'route="/api/v1/support/stream-ticket"',
  DATA_PREFIX: 'data:',
  TIMEOUT_MS: 10_000
} as const;
