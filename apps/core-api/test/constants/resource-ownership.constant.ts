import { HTTP_STATUS } from './http-status.constant';

export const RESOURCE_OWNERSHIP = {
  ...HTTP_STATUS,
  OWNER_EMAIL: 'player1@realtime-wallet-payments.com',
  OTHER_EMAIL: 'player2@realtime-wallet-payments.com',
  STAFF_EMAIL: 'admin@realtime-wallet-payments.com',
  ROUTES: ['payment', 'ledgerAccount', 'accountEntries', 'transactionEntries'],
  ALL_ENTRIES_PATH: '/ledgers/accounts/all/entries?page=1&limit=5',
  MALFORMED_PAYMENT_PATH: '/payments/not-a-uuid',
  PAYMENT_PATH: (id: string): string => `/payments/${id}`,
  ACCOUNT_PATH: (id: string): string => `/ledgers/accounts/${id}`,
  ACCOUNT_ENTRIES_PATH: (id: string): string => `/ledgers/accounts/${id}/entries?page=1&limit=5`,
  TRANSACTION_ENTRIES_PATH: (id: string): string => `/ledgers/transactions/${id}/entries`,
  PAYMENT_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, currency, type, status, amount_minor, provider)
                SELECT 'ownership-spec', u.id, w.id, w.currency, 'DEPOSIT', 'PENDING', 1234, 'stripe'
                FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
  ACCOUNT_SQL: 'SELECT la.id FROM ledger_accounts la JOIN users u ON u.id = la.user_id WHERE u.email = $1',
  ENTRY_SQL: 'SELECT transaction_id FROM ledger_entries WHERE account_id = $1 LIMIT 1',
  SYSTEM_ACCOUNT_SQL: "SELECT id FROM ledger_accounts WHERE owner_type = 'SYSTEM' LIMIT 1"
} as const;
