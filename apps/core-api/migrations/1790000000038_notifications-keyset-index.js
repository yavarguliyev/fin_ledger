export { shorthands } from './utils/shorthands.js';

const TABLE = 'notifications';
const KEYSET_INDEX = 'idx_notifications_user_keyset';
const OLD_INDEX = 'idx_notifications_user_created';

export const up = pgm => {
  pgm.sql(`CREATE INDEX IF NOT EXISTS ${KEYSET_INDEX} ON ${TABLE} (user_id, created_at DESC, id DESC);`);
  pgm.sql(`DROP INDEX IF EXISTS ${OLD_INDEX};`);
};

export const down = pgm => {
  pgm.sql(`CREATE INDEX IF NOT EXISTS ${OLD_INDEX} ON ${TABLE} (user_id, created_at);`);
  pgm.sql(`DROP INDEX IF EXISTS ${KEYSET_INDEX};`);
};
