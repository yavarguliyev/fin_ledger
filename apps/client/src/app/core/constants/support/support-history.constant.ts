export const SUPPORT_HISTORY = {
  PATHS: { CLEAR: '/clear', DELETE_MANY: '/messages/delete' },
  CLEARED: 'Chat cleared.',
  CLEAR_FAILED: 'Could not clear this chat. Try again.',
  DELETE_FAILED: 'Could not delete those messages.',
  PARTLY_DELETED: 'Some messages could not be deleted.'
} as const;
