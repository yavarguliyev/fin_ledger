export enum PaymentMethodStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  REJECTED = 'REJECTED',
  REMOVED = 'REMOVED',
  VERIFIED = 'VERIFIED'
}

export enum PaymentMethodType {
  APPLE_PAY = 'APPLE_PAY',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  GOOGLE_PAY = 'GOOGLE_PAY'
}

export enum PaymentOperation {
  DEPOSIT = 'deposit',
  PAYOUT = 'payout',
  REFUND = 'refund'
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
  AMEX = 'amex',
  DISCOVER = 'discover',
  MASTERCARD = 'mastercard',
  UNKNOWN = 'unknown',
  VISA = 'visa'
}

export enum DigitalWalletType {
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}

export enum ProviderChargeStatus {
  FAILED = 'failed',
  INDETERMINATE = 'indeterminate',
  PENDING = 'pending',
  REQUIRES_ACTION = 'requires_action',
  SUCCEEDED = 'succeeded'
}

export enum PaymentProvider {
  ADYEN = 'adyen',
  PAYPAL = 'paypal',
  STRIPE = 'stripe'
}
