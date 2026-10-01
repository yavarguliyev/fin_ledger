export const DEPOSIT_LIMIT = {
  COOLING_OFF_HOURS: 24,
  MS_PER_HOUR: 3_600_000,
  PERIOD_TRUNC: {
    DAILY: 'day',
    WEEKLY: 'week',
    MONTHLY: 'month'
  },
  SPENT_SQL: `
    SELECT COALESCE(SUM(amount_minor), 0)::text AS spent
    FROM payments
    WHERE user_id = $1
      AND currency = $2
      AND type = 'DEPOSIT'
      AND status <> ALL($4::text[])
      AND created_at >= date_trunc($3, now())
  `,
  EXCLUDED_STATUSES: ['FAILED', 'CANCELLED'],
  NOT_FOUND_MESSAGE: 'No deposit limit is set for that period',
  LOWERED_MESSAGE: 'Your deposit limit was lowered straight away.',
  RAISE_PENDING_MESSAGE: 'Raising a limit takes effect after a 24 hour cooling-off period.',
  EXCEEDED_MESSAGE: 'This deposit would take you over your deposit limit.'
} as const;
