export const CHAT_SEARCH = {
  DEBOUNCE_MS: 300,
  MIN_LENGTH: 2,
  RETRY_MS: 300,
  MAX_ATTEMPTS: 20,
  FLASH_MS: 1600,
  FLASH_CLASSES: ['ring-2', 'ring-primary', 'rounded-2xl'],
  SCROLL_BLOCK: 'center',
  SCROLL_BEHAVIOR: 'smooth',
  PLACEHOLDER: 'Search in this chat',
  OPEN_LABEL: 'Search messages',
  CLOSE_LABEL: 'Close search',
  NO_RESULTS: 'No messages found',
  NOT_LOADED: 'That message is too far back to open',
  ESCAPE_KEY: 'Escape'
} as const;
