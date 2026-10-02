export { shorthands } from './utils/shorthands.js';

const COLUMN = 'reply_to_message_id';
const CONSTRAINT = 'fk_support_messages_reply_to';

export const up = pgm => {
  pgm.sql(`
    ALTER TABLE support_messages
      ADD COLUMN ${COLUMN} uuid,
      ADD CONSTRAINT ${CONSTRAINT} FOREIGN KEY (${COLUMN}) REFERENCES support_messages (id) ON DELETE SET NULL;
  `);
};

export const down = pgm => {
  pgm.sql(`ALTER TABLE support_messages DROP CONSTRAINT IF EXISTS ${CONSTRAINT}, DROP COLUMN IF EXISTS ${COLUMN};`);
};
