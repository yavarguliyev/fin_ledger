export { shorthands } from './utils/shorthands.js';

const ROLE_KEYSET = 'idx_users_role_keyset';

export const up = pgm => {
  pgm.sql(`CREATE INDEX IF NOT EXISTS ${ROLE_KEYSET} ON users (role, created_at DESC, id DESC);`);
};

export const down = pgm => {
  pgm.sql(`DROP INDEX IF EXISTS ${ROLE_KEYSET};`);
};
