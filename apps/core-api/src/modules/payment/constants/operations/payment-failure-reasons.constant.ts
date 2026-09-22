export const PAYMENT_FAILURE_REASONS = {
  CHARGE_DECLINED: 'Payment charge was declined',
  NOT_FOUND_AT_PROVIDER: 'The payment provider has no record of this payment',
  OUTCOME_UNCONFIRMED: 'Provider outcome unconfirmed',
  PAYOUT_DECLINED: 'Withdrawal payout was declined',
  PAYOUT_FAILED: 'Withdrawal payout failed'
} as const;
