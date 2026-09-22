export const ERROR_RESPONSES = {
  HTTP_CODE_PREFIX: 'HTTP_',
  INTERNAL: { CODE: 'INTERNAL_ERROR', MESSAGE: 'Something went wrong. Please try again later.' },
  REQUEST_FAILED_MESSAGE: 'Request failed',
  UNAVAILABLE_MESSAGE: 'The service is temporarily unavailable. Please try again shortly.',
  VALIDATION_FAILED_MESSAGE: 'Validation failed'
} as const;
