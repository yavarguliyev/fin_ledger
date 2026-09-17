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
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED',
  COMPENSATED = 'COMPENSATED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REFUNDED = 'REFUNDED'
}

export enum PaymentType {
  GET = 'GET',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL'
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
