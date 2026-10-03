import path from 'node:path';

export const RABBIT_PROBE = {
  DLQ_CLI: path.join(path.resolve(__dirname, '../../../..'), 'scripts/rabbitmq/dlq.mjs'),
  DELIVERY_WAIT_MS: 10_000,
  DELIVERY_POLL_MS: 100,
  RECONNECT_WAIT_MS: 20_000,
  URL_KEY: 'RABBITMQ_URL',
  PREFIX: 'probe.',
  PAYLOAD: { probe: true },
  FAILURE: 'handler always throws',
  MANAGEMENT_CREDENTIALS: 'guest:guest',
  CONNECTIONS_PATH: '/api/connections',
  ENCODING: 'utf8',
  DEPTH_COMMAND: 'depth',
  ROW_SEPARATOR: '\n',
  COLUMN_SEPARATOR: '\t',
  ONE_MESSAGE: '1'
} as const;
