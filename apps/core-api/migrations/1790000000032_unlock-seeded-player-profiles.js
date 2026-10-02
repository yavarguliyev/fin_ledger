export { shorthands } from './utils/shorthands.js';

const SEEDED_PLAYERS = "email LIKE 'player%@realtime-wallet-payments.com' AND role = 'USER'";

const setKycStatus = (from, to) => `UPDATE users SET kyc_status = '${to}' WHERE ${SEEDED_PLAYERS} AND kyc_status = '${from}';`;

export const up = pgm => {
  pgm.sql(setKycStatus('APPROVED', 'NOT_STARTED'));
};

export const down = pgm => {
  pgm.sql(setKycStatus('NOT_STARTED', 'APPROVED'));
};
