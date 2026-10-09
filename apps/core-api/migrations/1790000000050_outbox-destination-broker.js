export { shorthands } from './utils/shorthands.js';

const TABLE = 'outbox_events';
const CONSTRAINT = 'chk_outbox_events_destination';
const LEGACY = 'RABBITMQ';
const BROKER = 'BROKER';
const KAFKA = 'KAFKA';

const quoted = values => values.map(value => `'${value}'`).join(', ');

const replaceCheck = (pgm, values) => {
  pgm.dropConstraint(TABLE, CONSTRAINT);
  pgm.addConstraint(TABLE, CONSTRAINT, { check: `destination IN (${quoted(values)})` });
};

export const up = pgm => {
  replaceCheck(pgm, [BROKER, LEGACY, KAFKA]);
  pgm.sql(`UPDATE ${TABLE} SET destination = '${BROKER}' WHERE destination = '${LEGACY}';`);
  pgm.alterColumn(TABLE, 'destination', { default: BROKER });
};

export const down = pgm => {
  pgm.sql(`UPDATE ${TABLE} SET destination = '${LEGACY}' WHERE destination = '${BROKER}';`);
  pgm.alterColumn(TABLE, 'destination', { default: LEGACY });
  replaceCheck(pgm, [LEGACY, KAFKA]);
};
