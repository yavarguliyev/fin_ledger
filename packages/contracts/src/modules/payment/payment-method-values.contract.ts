export const PAYMENT_METHOD_TYPES = ['APPLE_PAY', 'BANK_ACCOUNT', 'CREDIT_CARD', 'DEBIT_CARD', 'GOOGLE_PAY'] as const;

export const PAYMENT_METHOD_STATUSES = ['PENDING_VERIFICATION', 'REJECTED', 'REMOVED', 'VERIFIED'] as const;

export const CARD_BRANDS = ['amex', 'discover', 'mastercard', 'unknown', 'visa'] as const;

export const DIGITAL_WALLET_TYPES = ['apple_pay', 'google_pay'] as const;

export const PAYMENT_PROVIDERS = ['adyen', 'paypal', 'stripe'] as const;
