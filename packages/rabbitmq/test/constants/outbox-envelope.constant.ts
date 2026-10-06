export const OUTBOX_ENVELOPE_TEST = {
  EVENT_ID: '0199a7a0-0000-7000-8000-000000000001',
  EVENT_TYPE: 'wallet.credited',
  CORRELATION_ID: 'req-123',
  OCCURRED_AT: '2026-10-06T10:00:00.123Z',
  KAFKA: 'KAFKA',
  RABBITMQ: 'RABBITMQ',
  TYPE_HEADER: 'x-event-type',
  VERSION_HEADER: 'x-event-version',
  ID_HEADER: 'x-event-id',
  OCCURRED_HEADER: 'x-occurred-at',
  CORRELATION_HEADER: 'x-correlation-id'
} as const;
