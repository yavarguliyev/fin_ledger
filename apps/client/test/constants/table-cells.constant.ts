export const TABLE_CELLS_TEST = {
  ISO: '2026-10-02T09:44:51.918Z',
  ISO_PATTERN: /\d{4}-\d{2}-\d{2}T/,
  FORMATTED_PATTERN: /^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{2}:\d{2} (AM|PM)$/,
  REFERENCE: 'withdrawal: 01a0fc00-9092-7abc-8def-0123456789ab',
  SHORT_REFERENCE: 'withdrawal: 01a0fc00',
  PLAIN_REFERENCE: 'manual adjustment',
  EMPTY: '—',
  DATE_KEY: 'createdAt',
  DATE_LABEL: 'Date'
} as const;
