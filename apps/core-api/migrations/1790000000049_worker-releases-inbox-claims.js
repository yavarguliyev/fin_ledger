export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.sql('GRANT DELETE ON inbox_messages TO app_worker_group;');
};

export const down = pgm => {
  pgm.sql('REVOKE DELETE ON inbox_messages FROM app_worker_group;');
};
