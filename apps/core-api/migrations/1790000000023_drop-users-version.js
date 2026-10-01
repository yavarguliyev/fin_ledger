export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.dropColumn('users', 'version');
};

export const down = pgm => {
  pgm.addColumn('users', { version: { type: 'integer', notNull: true, default: 0 } });
};
