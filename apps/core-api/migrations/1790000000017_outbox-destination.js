export { shorthands } from './utils/shorthands.js';
import { addEnumCheck } from './utils/enum-check.js';

export const up = pgm => {
  pgm.addColumns('outbox_events', {
    destination: { type: 'text', notNull: true, default: 'RABBITMQ' }
  });

  addEnumCheck(pgm, { table: 'outbox_events', column: 'destination', name: 'outbox_destination' });

  pgm.sql(`
    CREATE INDEX idx_outbox_events_dispatch_destination
    ON outbox_events (destination, available_at, id)
    WHERE status = 'PENDING';
  `);
};

export const down = pgm => {
  pgm.sql('DROP INDEX IF EXISTS idx_outbox_events_dispatch_destination;');
  pgm.dropConstraint('outbox_events', 'chk_outbox_events_destination');
  pgm.dropColumns('outbox_events', ['destination']);
};
