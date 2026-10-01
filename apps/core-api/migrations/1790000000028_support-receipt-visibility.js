export { shorthands } from './utils/shorthands.js';

const RECEIPTS = 'support_read_receipts';
const CONVERSATIONS = 'support_conversations';
const POLICY = `${RECEIPTS}_participant_read`;

// A read receipt is shared state of a conversation, not private to the reader: the whole
// point of a "seen" tick is that the OTHER person learns you read it. The owner policy
// only exposes your own row, which made every tick look unread to the sender.
export const up = pgm => {
  pgm.sql(`
    CREATE POLICY ${POLICY} ON ${RECEIPTS}
      FOR SELECT
      TO app_readwrite
      USING (
        EXISTS (
          SELECT 1 FROM ${CONVERSATIONS} c
           WHERE c.id = conversation_id
             AND c.customer_user_id = app_current_user_id()
        )
      );
  `);
};

export const down = pgm => {
  pgm.sql(`DROP POLICY IF EXISTS ${POLICY} ON ${RECEIPTS};`);
};
