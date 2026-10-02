export const CHAT_FAILURE = {
  TOO_MANY: 429,
  SERVER_ERROR: 500,
  THROTTLED: 'ThrottlerException: Too Many Requests',
  BROKEN: 'boom',
  FALLBACK: 'Message could not be sent',
  TOO_FAST: 'You are sending messages too quickly. Wait a few seconds and try again.'
} as const;
