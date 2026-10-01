export const STRIPE_ERROR_DEFAULTS = {
  MESSAGE: 'Payment provider request failed',
  CLIENT_NOT_INITIALIZED: 'Stripe client not initialized',
  UNVERIFIABLE_WEBHOOK: 'Stripe webhook signature cannot be verified'
} as const;
