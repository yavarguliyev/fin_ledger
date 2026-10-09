export const SUPPORT_PREFERENCES = {
  TABLE: 'support_conversation_preferences',
  PIN_LIMIT: 3,
  PIN_LIMIT_MESSAGE: 'You can pin up to 3 chats. Unpin one first.',
  THEME_NOTICE: 'Chat theme changed.',
  MUTE_SECONDS: { EIGHT_HOURS: 28_800, ONE_WEEK: 604_800, ALWAYS: null, OFF: 0 },
  ROUTES: {
    MUTE: 'conversations/:id/mute',
    PIN: 'conversations/:id/pin',
    FAVOURITE: 'conversations/:id/favourite',
    THEME: 'conversations/:id/theme'
  }
} as const;
