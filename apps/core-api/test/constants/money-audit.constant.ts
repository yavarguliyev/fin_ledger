export const MONEY_AUDIT_TEST = {
  INSERT_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, destination)
               VALUES ($1, $2, $3, $4, $5::jsonb, 'KAFKA')`,
  AMOUNT_MINOR: 1500,
  CURRENCY: 'USD',
  CASES: [
    { aggregateType: 'Wallet', topic: 'analytics.wallet.credited', action: 'WALLET_CREDITED', idKey: 'walletId' },
    { aggregateType: 'Wallet', topic: 'analytics.wallet.debited', action: 'WALLET_DEBITED', idKey: 'walletId' },
    { aggregateType: 'Payment', topic: 'analytics.payment.completed', action: 'PAYMENT_COMPLETED', idKey: 'paymentId' },
    { aggregateType: 'Payment', topic: 'analytics.payment.failed', action: 'PAYMENT_FAILED', idKey: 'paymentId' }
  ]
} as const;
