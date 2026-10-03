export { shorthands } from './utils/shorthands.js';

const ACCOUNT_KEYSET = 'idx_ledger_entries_account_keyset';
const ALL_KEYSET = 'idx_ledger_entries_keyset';
const OLD_INDEX = 'idx_ledger_entries_account_created';

export const up = pgm => {
  pgm.sql('SET CONSTRAINTS ALL IMMEDIATE;');
  pgm.sql(`CREATE INDEX IF NOT EXISTS ${ACCOUNT_KEYSET} ON ledger_entries (account_id, created_at DESC, id DESC);`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS ${ALL_KEYSET} ON ledger_entries (created_at DESC, id DESC);`);
  pgm.sql(`DROP INDEX IF EXISTS ${OLD_INDEX};`);
};

export const down = pgm => {
  pgm.sql(`CREATE INDEX IF NOT EXISTS ${OLD_INDEX} ON ledger_entries (account_id, created_at);`);
  pgm.sql(`DROP INDEX IF EXISTS ${ALL_KEYSET};`);
  pgm.sql(`DROP INDEX IF EXISTS ${ACCOUNT_KEYSET};`);
};
