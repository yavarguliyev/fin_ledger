export const SESSION_END_TEST = {
  URL: 'http://localhost:3000/api/v1/notifications/stream-ticket',
  METHOD: 'POST',
  STALE_TOKEN: 'stale-access-token',
  DEVICE_ID: 'device-1',
  UNAUTHORIZED: 401
} as const;
