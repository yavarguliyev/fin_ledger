export const HTTP_ERRORS = {
  ISSUE_SEPARATOR: ', ',
  PATH_SEPARATOR: '.',
  ISSUES_KEY: 'errors',
  MESSAGE_KEY: 'message',
  PATH_KEY: 'path',
  ERROR_KEY: 'error',
  SERVER_ERROR_KEY: 'server',
  OFFLINE_MESSAGE: 'Cannot connect to server. Please check your connection.',
  UNAUTHORIZED_MESSAGE: 'Unauthorized. Please sign in again.',
  FALLBACK_MESSAGE: 'An error occurred. Please try again.',
  OFFLINE_STATUS: 0,
  UNAUTHORIZED_STATUS: 401
} as const;
