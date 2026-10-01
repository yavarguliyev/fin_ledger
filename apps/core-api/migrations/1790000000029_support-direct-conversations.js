export { shorthands } from './utils/shorthands.js';

const CONVERSATIONS = 'support_conversations';
const PER_CUSTOMER = 'uq_support_conversations_open_per_customer';
const PER_PAIR = 'uq_support_conversations_open_per_pair';
const UNASSIGNED = 'uq_support_conversations_open_unassigned';

export const up = pgm => {
  pgm.dropIndex(CONVERSATIONS, 'customer_user_id', { name: PER_CUSTOMER });
  pgm.createIndex(CONVERSATIONS, ['customer_user_id', 'assigned_staff_id'], {
    name: PER_PAIR,
    unique: true,
    where: "status = 'OPEN' AND assigned_staff_id IS NOT NULL"
  });
  pgm.createIndex(CONVERSATIONS, 'customer_user_id', {
    name: UNASSIGNED,
    unique: true,
    where: "status = 'OPEN' AND assigned_staff_id IS NULL"
  });
};

export const down = pgm => {
  pgm.sql(`
    UPDATE ${CONVERSATIONS} c
       SET status = 'CLOSED', updated_at = now()
     WHERE c.status = 'OPEN'
       AND EXISTS (
         SELECT 1 FROM ${CONVERSATIONS} newer
          WHERE newer.customer_user_id = c.customer_user_id
            AND newer.status = 'OPEN'
            AND (newer.last_message_at, newer.id) > (c.last_message_at, c.id)
       );
  `);
  pgm.dropIndex(CONVERSATIONS, 'customer_user_id', { name: UNASSIGNED });
  pgm.dropIndex(CONVERSATIONS, ['customer_user_id', 'assigned_staff_id'], { name: PER_PAIR });
  pgm.createIndex(CONVERSATIONS, 'customer_user_id', { name: PER_CUSTOMER, unique: true, where: "status = 'OPEN'" });
};
