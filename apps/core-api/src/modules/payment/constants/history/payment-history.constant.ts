export const PAYMENT_HISTORY = {
  INSERT_SQL: `
    INSERT INTO payment_status_history (payment_id, from_status, to_status, source)
         VALUES ($1, $2, $3, $4)
  `,
  DEFAULT_SOURCE: 'state-machine'
} as const;
