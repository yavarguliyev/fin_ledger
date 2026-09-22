import { RabbitmqRegistry } from '@common/shared-libs';

export const RABBITMQ_CONSTANTS = {
  RABBITMQ_EXCHANGE: { key: 'wallet.events' },
  RABBITMQ_DLX_EXCHANGE: { key: 'wallet.events.dlx' },
  KAFKA_ANALYTICS_TOPIC: { key: 'wallet.analytics' },
  OUTBOX_POLL_INTERVAL_MS: { key: 5000 },
  OUTBOX_BATCH_SIZE: { key: 50 }
} satisfies RabbitmqRegistry;
