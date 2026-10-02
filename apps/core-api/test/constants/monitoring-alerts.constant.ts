export const MONITORING_ALERTS_TEST = {
  TOKEN: 'integration-alert-webhook-token-0123456789abcdef',
  WRONG_TOKEN: 'Bearer not-the-alert-webhook-token-0123456789',
  BEARER: 'Bearer ',
  PATH: '/monitoring/alerts',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  ALERT_NAME: 'IntegrationProbeAlert',
  SEVERITY: 'warning',
  SUMMARY: 'Integration probe fired',
  DESCRIPTION: 'Raised by the monitoring alerts spec.',
  FIRING: 'firing',
  TITLE: 'Alert firing: IntegrationProbeAlert [warning]',
  EMAIL_EVENT: 'email.admin.monitoring-alert',
  NOTIFICATION_SQL: `SELECT n.content FROM notifications n JOIN users u ON u.id = n.user_id
                      WHERE u.email = $1 AND n.title = $2 AND n.type = 'SYSTEM'`,
  EMAIL_SQL: `SELECT payload->>'to' AS "to" FROM outbox_events WHERE event_type = $1 AND payload->>'subject' = $2`,
  NO_CONTENT: 204,
  UNAUTHORIZED: 401
} as const;
