exports.shorthands = undefined;

const PURPOSES = ['account_invite', 'email_change', 'email_verification', 'mfa_challenge', 'password_reset'];
const LEGACY_PURPOSES = PURPOSES.filter(purpose => purpose !== 'email_change');

const purposeCheck = purposes => ({ check: `purpose IN (${purposes.map(purpose => `'${purpose}'`).join(', ')})` });

exports.up = pgm => {
  pgm.addColumn('users', { pending_email: { type: 'citext' } });
  pgm.dropConstraint('auth_tokens', 'chk_auth_tokens_purpose');
  pgm.addConstraint('auth_tokens', 'chk_auth_tokens_purpose', purposeCheck(PURPOSES));
};

exports.down = pgm => {
  pgm.sql("DELETE FROM auth_tokens WHERE purpose = 'email_change'");
  pgm.dropConstraint('auth_tokens', 'chk_auth_tokens_purpose');
  pgm.addConstraint('auth_tokens', 'chk_auth_tokens_purpose', purposeCheck(LEGACY_PURPOSES));
  pgm.dropColumn('users', 'pending_email');
};
