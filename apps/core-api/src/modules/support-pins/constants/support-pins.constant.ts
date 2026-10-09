export const SUPPORT_PINS = {
  TABLE: 'support_pinned_messages',
  LIMIT: 3,
  DURATION_SECONDS: { DAY: 86_400, WEEK: 604_800, MONTH: 2_592_000 },
  DURATIONS: ['DAY', 'WEEK', 'MONTH'],
  NOTICE: 'A message was pinned.',
  NOT_PINNABLE_MESSAGE: 'This message cannot be pinned.',
  ROUTES: {
    LIST: 'conversations/:id/pins',
    PIN: 'conversations/:id/messages/:messageId/pin'
  }
} as const;
