import { HTTP_STATUS } from './http-status.constant';

export const HEALTH_METRICS_TEST = {
  ...HTTP_STATUS,
  API_SUFFIX: /\/api\/v\d+$/,
  EMPTY: '',
  LIVE_PATH: '/health/live',
  READY_PATH: '/health/ready',
  METRICS_PATH: '/metrics',
  OK_STATUS: 'ok',
  UP_STATUS: 'up',
  DATABASE: 'database',
  DEPENDENCIES: ['database', 'redis', 'broker'],
  CONTENT_TYPE: 'content-type',
  TEXT_PLAIN: 'text/plain',
  NO_CONNECTIONS: 0,
  METRICS: [
    'core_api_db_pool_connections_total',
    'core_api_db_pool_connections_waiting',
    'core_api_outbox_events_pending',
    'core_api_outbox_events_dead',
    'core_api_outbox_oldest_pending_seconds',
    'core_api_process_cpu_user_seconds_total'
  ]
} as const;
