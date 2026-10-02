export { shorthands } from './utils/shorthands.js';

const OUTBOX = 'outbox_events';
const TOKEN_EMAIL_TYPES = ['email.user.verification', 'email.user.password-reset', 'email.user.email-change-confirm'];
const REDACTED = '[redacted]';
const quoted = values => values.map(value => `'${value}'`).join(', ');

export const up = pgm => {
  pgm.sql(`
    UPDATE ${OUTBOX}
       SET payload = jsonb_set(payload, '{url}', to_jsonb('${REDACTED}'::text))
     WHERE event_type IN (${quoted(TOKEN_EMAIL_TYPES)})
       AND status <> 'PENDING'
       AND payload->>'url' LIKE '%token=%';
  `);
};

export const down = () => {};
