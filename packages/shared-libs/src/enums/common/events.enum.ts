export enum DomainEventType {
  NOTIFICATION_CREATED = 'notification.created',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_COMPENSATED = 'payment.compensated',
  PAYMENT_FAILED = 'payment.failed',
  USER_REGISTERED = 'user.registered',
  WALLET_CREDITED = 'wallet.credited',
  WALLET_DEBITED = 'wallet.debited',
  NONE = 'none'
}
