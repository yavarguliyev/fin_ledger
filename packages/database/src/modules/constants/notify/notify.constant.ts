export const NOTIFY = {
  RECONNECT_MS: 5_000,
  CHANNEL_PATTERN: /^[a-z_][a-z0-9_]*$/,
  LISTEN: 'LISTEN ',
  NOTIFICATION_EVENT: 'notification',
  ERROR_EVENT: 'error',
  END_EVENT: 'end',
  INVALID_CHANNEL: 'Invalid notification channel'
} as const;
