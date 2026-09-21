export enum PaymentMethodStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  REJECTED = 'REJECTED',
  REMOVED = 'REMOVED',
  VERIFIED = 'VERIFIED'
}

export enum PaymentMethodType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY'
}

export enum PaymentStatus {
  CANCELLED = 'CANCELLED',
  COMPENSATED = 'COMPENSATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REQUIRES_ACTION = 'REQUIRES_ACTION'
}

export enum PaymentType {
  CHARGEBACK = 'CHARGEBACK',
  DEPOSIT = 'DEPOSIT',
  REFUND = 'REFUND',
  WITHDRAWAL = 'WITHDRAWAL'
}

export enum PaymentCapability {
  CHARGE = 'CHARGE',
  HOSTED_SETUP = 'HOSTED_SETUP',
  METHOD_VAULT = 'METHOD_VAULT',
  PAYOUT = 'PAYOUT',
  WEBHOOKS = 'WEBHOOKS'
}

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  UNKNOWN = 'unknown'
}

export enum DigitalWalletType {
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}

export enum ProviderChargeStatus {
  SUCCEEDED = 'succeeded',
  PENDING = 'pending',
  FAILED = 'failed',
  INDETERMINATE = 'indeterminate',
  REQUIRES_ACTION = 'requires_action'
}

export enum WithdrawalReviewStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  ADYEN = 'adyen'
}
