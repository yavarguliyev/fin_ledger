export const WEBHOOK_PROVIDER_TEST = {
  METHOD: 'POST',
  UNKNOWN_PROVIDER_PATH: '/webhooks/not-a-provider',
  EVENT_ID: 'evt_unknown_provider',
  EVENT_TYPE: 'payment_intent.succeeded',
  UNSUPPORTED: /Unsupported payment provider: not-a-provider\. Available: .*stripe/,
  SQL_COUNT: 'SELECT count(*)::int AS count FROM webhook_events WHERE event_id = $1'
} as const;
