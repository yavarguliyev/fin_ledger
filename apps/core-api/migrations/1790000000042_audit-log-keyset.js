export { shorthands } from './utils/shorthands.js';

const KEYSET = 'idx_audit_log_keyset';

export const up = pgm => {
  pgm.sql(`CREATE INDEX IF NOT EXISTS ${KEYSET} ON audit_log (created_at DESC, id DESC);`);
};

export const down = pgm => {
  pgm.sql(`DROP INDEX IF EXISTS ${KEYSET};`);
};
