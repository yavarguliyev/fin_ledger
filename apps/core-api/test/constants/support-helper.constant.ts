export const SUPPORT_HELPER = {
  AUTHORIZATION_HEADER: 'Authorization',
  FORWARDED_FOR_HEADER: 'X-Forwarded-For',
  BEARER_PREFIX: 'Bearer ',
  MESSAGES_SUFFIX: '/messages',
  READ_SUFFIX: '/read',
  HEARTBEAT_PATH: '/support/presence/heartbeat',
  PRESENCE_PATH: '/support/presence',
  SCOPE_QUERY: '?scope=',
  PATH_SEPARATOR: '/',
  BODY_FIELD: 'body'
} as const;
