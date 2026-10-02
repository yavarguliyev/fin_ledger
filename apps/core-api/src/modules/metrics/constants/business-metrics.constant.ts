export const BUSINESS_METRICS = {
  PAYMENTS: 'payments_last_minute',
  BETS: 'bets_last_minute',
  PAYMENT_LABELS: ['type', 'outcome'],
  BET_LABELS: ['outcome'],
  PAYMENT_KIND: 'payment',
  BET_KIND: 'bet',
  PAYMENT_TYPES: ['DEPOSIT', 'WITHDRAWAL', 'REFUND', 'CHARGEBACK'],
  PAYMENT_OUTCOMES: ['created', 'completed', 'failed'],
  BET_OUTCOMES: ['placed', 'won', 'lost', 'voided', 'cashed_out'],
  SQL: `SELECT 'payment' AS kind, type, 'created' AS outcome, count(*)::int AS total
          FROM payments WHERE created_at > now() - interval '1 minute' GROUP BY type
        UNION ALL
        SELECT 'payment', type, 'completed', count(*)::int
          FROM payments WHERE created_at > now() - interval '1 day' AND completed_at > now() - interval '1 minute' GROUP BY type
        UNION ALL
        SELECT 'payment', type, 'failed', count(*)::int
          FROM payments WHERE created_at > now() - interval '1 day' AND failed_at > now() - interval '1 minute' GROUP BY type
        UNION ALL
        SELECT 'bet', '', 'placed', count(*)::int
          FROM bets WHERE placed_at > now() - interval '1 minute'
        UNION ALL
        SELECT 'bet', '', lower(status), count(*)::int
          FROM bets WHERE placed_at > now() - interval '30 days' AND settled_at > now() - interval '1 minute' GROUP BY status`
} as const;
