import { HTTP_STATUS } from './http-status.constant';

export const CORRELATION_ID_TEST = {
  ...HTTP_STATUS,
  EMAIL_PREFIX: 'correlation+',
  EMAIL_DOMAIN: '@realtime-wallet-payments.com',
  REGISTER_PATH: '/auth/register',
  PUBLIC_PATH: '/game-events',
  POST: 'POST',
  CONTENT_TYPE: 'content-type',
  JSON: 'application/json',
  PASSWORD: 'CorrelationPass123!',
  DISPLAY_NAME: 'Correlation Probe',
  OUTBOX_SQL: 'SELECT trace_id, event_type FROM outbox_events WHERE trace_id = $1',
  NO_ROWS: 0,
  EMPTY: ''
} as const;
