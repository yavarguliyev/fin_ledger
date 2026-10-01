export const PASSKEY_TEST = {
  REGISTER_OPTIONS_PATH: '/auth/passkeys/register/options',
  REGISTER_VERIFY_PATH: '/auth/passkeys/register/verify',
  LOGIN_OPTIONS_PATH: '/auth/passkeys/login/options',
  LOGIN_VERIFY_PATH: '/auth/passkeys/login/verify',
  LIST_PATH: '/auth/passkeys',
  EMAIL: 'player24@realtime-wallet-payments.com',
  OWNER: 'passkey-owner-handle',
  DEVICE_LABEL: 'Integration laptop',
  CREDENTIAL_ID: 'aW50ZWdyYXRpb24tY3JlZGVudGlhbA',
  PUBLIC_KEY: 'cHVibGljLWtleS1ieXRlcw',
  SEED_SQL: `
    INSERT INTO user_credentials (user_id, credential_id, public_key, sign_count, transports, device_label, backed_up)
    SELECT id, $2, $3, 5, ARRAY['internal'], $4, true FROM users WHERE email = $1
  `,
  COUNT_SQL: `
    SELECT count(*)::int AS count FROM user_credentials c JOIN users u ON u.id = c.user_id WHERE u.email = $1
  `,
  BIOMETRIC_COLUMNS_SQL: `
    SELECT column_name FROM information_schema.columns WHERE table_name = 'user_credentials'
  `,
  CLEAN_SQL: 'DELETE FROM user_credentials WHERE credential_id = $1',
  FORBIDDEN_WORDS: ['biometric', 'fingerprint', 'face', 'template', 'image'],
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404
} as const;
