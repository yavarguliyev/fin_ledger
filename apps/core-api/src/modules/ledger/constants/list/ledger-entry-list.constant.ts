const COLUMNS = `id, transaction_id AS "transactionId", account_id AS "accountId", entry_type AS "entryType", amount_minor AS "amountMinor",
                 currency, description, reference, sequence, created_at AS "createdAt"`;

export const LEDGER_ENTRY_LIST = {
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  CURSOR_MESSAGE: 'Pass both before and beforeId, or neither',
  ACCOUNT_SQL: `
    SELECT ${COLUMNS} FROM ledger_entries
     WHERE account_id = $1 AND ($2::timestamptz IS NULL OR (created_at, id) < ($2::timestamptz, $3::uuid))
     ORDER BY created_at DESC, id DESC
     LIMIT $4
  `,
  ALL_SQL: `
    SELECT ${COLUMNS} FROM ledger_entries
     WHERE ($1::timestamptz IS NULL OR (created_at, id) < ($1::timestamptz, $2::uuid))
     ORDER BY created_at DESC, id DESC
     LIMIT $3
  `
} as const;
