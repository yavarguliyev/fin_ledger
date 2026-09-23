export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createType('outbox_destination', ['RABBITMQ', 'KAFKA']);

  pgm.addColumns('outbox_events', {
    destination: { type: 'outbox_destination', notNull: true, default: 'RABBITMQ' }
  });

  pgm.sql(`
    CREATE INDEX idx_outbox_events_dispatch_destination
    ON outbox_events (destination, available_at, id)
    WHERE status = 'PENDING';
  `);
};

export const down = pgm => {
  pgm.sql('DROP INDEX IF EXISTS idx_outbox_events_dispatch_destination;');
  pgm.dropColumns('outbox_events', ['destination']);
  pgm.dropType('outbox_destination');
};
