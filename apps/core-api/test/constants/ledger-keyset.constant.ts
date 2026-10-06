import { HTTP_STATUS } from './http-status.constant';

export const LEDGER_KEYSET_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'player1@realtime-wallet-payments.com',
  PAGE: 2,
  ACCOUNT_SQL: 'SELECT la.id FROM ledger_accounts la JOIN users u ON u.id = la.user_id WHERE u.email = $1',
  ENTRY_IDS_SQL: 'SELECT id FROM ledger_entries WHERE account_id = $1 ORDER BY created_at DESC, id DESC',
  TIE_COUNT: 6,
  TIE_SQL: `WITH txn AS (
               INSERT INTO ledger_transactions (reference_type, description, idempotency_key)
               VALUES ('KEYSET_TEST', 'Keyset tie probe', gen_random_uuid()::text) RETURNING id
             )
             INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount_minor, currency, description, sequence, created_at)
             SELECT txn.id, la.id, CASE WHEN g % 2 = 0 THEN 'DEBIT' ELSE 'CREDIT' END, 1, la.currency, 'Keyset tie probe', g,
                    date_trunc('milliseconds', now()) + g * interval '1 microsecond'
               FROM txn, ledger_accounts la, generate_series(1, $2::int) g WHERE la.id = $1`,
  ENTRIES_PATH: '/ledgers/accounts/',
  ENTRIES_SUFFIX: '/entries?',
  EMPTY: ''
} as const;
