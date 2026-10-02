export { shorthands } from './utils/shorthands.js';

const CHANNEL = 'outbox_events';
const FUNCTION = 'notify_outbox_event';
const TRIGGER = 'trg_outbox_events_notify';

export const up = pgm => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION ${FUNCTION}() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      PERFORM pg_notify('${CHANNEL}', '');
      RETURN NULL;
    END;
    $$;
  `);
  pgm.sql(`CREATE TRIGGER ${TRIGGER} AFTER INSERT ON outbox_events FOR EACH STATEMENT EXECUTE FUNCTION ${FUNCTION}();`);
};

export const down = pgm => {
  pgm.sql(`DROP TRIGGER IF EXISTS ${TRIGGER} ON outbox_events;`);
  pgm.sql(`DROP FUNCTION IF EXISTS ${FUNCTION}();`);
};
