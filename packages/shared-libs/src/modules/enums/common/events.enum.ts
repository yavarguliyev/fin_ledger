export enum DomainEventType {
  NONE = 'none',
  NOTIFICATION_CREATED = 'notification.created',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_METHOD_REJECTED = 'payment_method.rejected',
  PAYMENT_METHOD_VERIFIED = 'payment_method.verified',
  USER_REGISTERED = 'user.registered',
  WALLET_CREDITED = 'wallet.credited',
  WALLET_DEBITED = 'wallet.debited'
}

export enum WebhookStatus {
  FAILED = 'FAILED',
  IGNORED = 'IGNORED',
  PROCESSED = 'PROCESSED',
  RECEIVED = 'RECEIVED'
}
