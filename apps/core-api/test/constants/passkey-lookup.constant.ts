export const PASSKEY_LOOKUP_TEST = {
  EMAIL: 'player24@realtime-wallet-payments.com',
  OWNER: 'passkey-lookup-owner',
  CREDENTIAL_ID: 'bG9va3VwLWNyZWRlbnRpYWwtaWQ',
  PUBLIC_KEY: 'bG9va3VwLXB1YmxpYy1rZXk',
  DEVICE_LABEL: 'Lookup laptop',
  LOGIN_OPTIONS_PATH: '/auth/passkeys/login/options',
  LOGIN_VERIFY_PATH: '/auth/passkeys/login/verify',
  SEED_SQL: `
    INSERT INTO user_credentials (user_id, credential_id, public_key, sign_count, transports, device_label, backed_up)
    SELECT id, $2, $3, 0, ARRAY['internal'], $4, true FROM users WHERE email = $1
  `,
  CLEAN_SQL: 'DELETE FROM user_credentials WHERE credential_id = $1',
  NOT_REGISTERED_MESSAGE: 'That passkey is not registered',
  UNAUTHORIZED: 401
} as const;
