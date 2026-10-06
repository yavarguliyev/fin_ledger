export const EVENT_TYPES = {
  USER_REGISTERED: 'user.registered',
  BET_SETTLED: 'bet.settled',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_METHOD_VERIFIED: 'payment_method.verified',
  PAYMENT_METHOD_REJECTED: 'payment_method.rejected',
  WALLET_CREDITED: 'wallet.credited',
  WALLET_DEBITED: 'wallet.debited',
  ANALYTICS_PAYMENT_COMPLETED: 'analytics.payment.completed',
  ANALYTICS_PAYMENT_FAILED: 'analytics.payment.failed',
  ANALYTICS_WALLET_CREDITED: 'analytics.wallet.credited',
  ANALYTICS_WALLET_DEBITED: 'analytics.wallet.debited'
} as const;

export const EVENT_VERSIONS = {
  V1: 1
} as const;
