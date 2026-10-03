export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.sql('GRANT DELETE ON login_events TO app_worker_group;');
};

export const down = pgm => {
  pgm.sql('REVOKE DELETE ON login_events FROM app_worker_group;');
};
