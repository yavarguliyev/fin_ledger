export const WEBHOOK_ERRORS = {
  CLAIM_FAILED: 'Failed to record webhook event',
  UNSUPPORTED_PROVIDER: 'Unsupported payment provider',
  AVAILABLE_PROVIDERS: 'Available',
  PROVIDER_SEPARATOR: ', ',
  MISSING_PROVIDER: 'Queued webhook has no provider attribute'
} as const;
