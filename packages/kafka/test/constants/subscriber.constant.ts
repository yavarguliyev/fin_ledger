export const SUBSCRIBER_SPEC = {
  TOPIC: 'analytics.wallet.credited',
  GROUP: 'core-api-consumer-group',
  MESSAGE_ID: 'analytics.wallet.credited:0:42',
  PARTITION: 0,
  OFFSET: '42',
  AUDIT_NAME: 'AuditListener.handle',
  ANALYTICS_NAME: 'AnalyticsListener.handle',
  MISSING: 'missing',
  METHOD: 'handle'
} as const;
