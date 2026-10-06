import { HTTP_STATUS } from './http-status.constant';

export const MONITORING_ALERTS_TEST = {
  ...HTTP_STATUS,
  TOKEN: 'integration-alert-webhook-token-0123456789abcdef',
  WRONG_TOKEN: 'Bearer not-the-alert-webhook-token-0123456789',
  BEARER: 'Bearer ',
  PATH: '/monitoring/alerts',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  ALERT_NAME: 'IntegrationProbeAlert',
  SEVERITY: 'warning',
  SUMMARY: 'Integration probe fired',
  DESCRIPTION: 'Raised by the monitoring alerts spec.',
  RESOLVED_SUMMARY: 'Integration probe resolved',
  FIRING: 'firing',
  RESOLVED: 'resolved',
  TITLE: 'Integration probe fired · Warning',
  RESOLVED_TITLE: 'Resolved: Integration probe resolved',
  STARTS_AT: '2026-10-05T19:12:00Z',
  ENDS_AT: '2026-10-05T19:24:00Z',
  LASTED: 'It lasted 12 min.',
  EMAIL_EVENT: 'email.admin.monitoring-alert',
  NOTIFICATION_SQL: `SELECT n.content FROM notifications n JOIN users u ON u.id = n.user_id
                      WHERE u.email = $1 AND n.title = $2 AND n.type = 'SYSTEM'`,
  EMAIL_SQL: `SELECT payload->>'to' AS "to" FROM outbox_events WHERE event_type = $1 AND payload->>'subject' = $2`,
  POST: 'POST',
  JSON_HEADERS: { 'Content-Type': 'application/json' }
} as const;
