export enum NotificationStatus {
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  READ = 'READ',
  SENT = 'SENT'
}

export enum NotificationType {
  BET_WON = 'BET_WON',
  INFO = 'INFO',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SYSTEM = 'SYSTEM',
  WALLET_CREDITED = 'WALLET_CREDITED',
  WALLET_DEBITED = 'WALLET_DEBITED'
}

export enum NotificationTitle {
  BET_WON = 'Bet Won',
  PAYMENT_COMPLETED = 'Payment Completed',
  PAYMENT_FAILED = 'Payment Failed',
  WELCOME = 'Welcome!',
  WALLET_CREDITED = 'Wallet Credited',
  WALLET_DEBITED = 'Wallet Debited'
}
