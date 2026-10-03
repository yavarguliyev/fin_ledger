export const REQUEST_TIMEOUT = {
  DEFAULT_MS: 20_000,
  UPLOAD_MS: 60_000,
  STATUS: 408,
  STATUS_TEXT: 'Request Timeout',
  MESSAGE: 'The server took too long to answer. Please try again.'
} as const;
