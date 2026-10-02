export const KAFKA_RETENTION_TEST = {
  CLIENT_ID: 'retention-check',
  CONFIG_NAME: 'retention.ms',
  EMAIL_RETENTION_MS: '86400000',
  EMAIL_TOPIC: 'email.user.password-reset',
  AUDIT_TOPIC: 'audit.log.recorded'
} as const;
