export { shorthands } from './utils/shorthands.js';

const MESSAGES = 'support_messages';
const KIND_CHECK = 'chk_support_messages_kind';
const KINDS = ['TEXT', 'IMAGE', 'FILE', 'VOICE', 'SYSTEM'];
const quoted = values => values.map(value => `'${value}'`).join(', ');

export const up = pgm => {
  pgm.dropConstraint(MESSAGES, KIND_CHECK);
  pgm.addConstraint(MESSAGES, KIND_CHECK, { check: `kind IN (${quoted([...KINDS, 'VIDEO'])})` });
};

export const down = pgm => {
  pgm.sql(`UPDATE ${MESSAGES} SET kind = 'FILE' WHERE kind = 'VIDEO';`);
  pgm.dropConstraint(MESSAGES, KIND_CHECK);
  pgm.addConstraint(MESSAGES, KIND_CHECK, { check: `kind IN (${quoted(KINDS)})` });
};
