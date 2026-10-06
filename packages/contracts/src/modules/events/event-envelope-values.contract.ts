export const EVENT_ENVELOPE = {
  CURRENT_VERSION: 1,
  HEADERS: {
    TYPE: 'x-event-type',
    VERSION: 'x-event-version',
    ID: 'x-event-id',
    OCCURRED_AT: 'x-occurred-at',
    CORRELATION_ID: 'x-correlation-id'
  }
} as const;
