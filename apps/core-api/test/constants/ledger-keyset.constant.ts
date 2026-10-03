import { HTTP_STATUS } from './http-status.constant';

export const LEDGER_KEYSET_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'player1@realtime-wallet-payments.com',
  PAGE: 2,
  ACCOUNT_SQL: 'SELECT la.id FROM ledger_accounts la JOIN users u ON u.id = la.user_id WHERE u.email = $1',
  ENTRY_IDS_SQL: 'SELECT id FROM ledger_entries WHERE account_id = $1 ORDER BY created_at DESC, id DESC',
  ENTRIES_PATH: '/ledgers/accounts/',
  ENTRIES_SUFFIX: '/entries?'
} as const;
