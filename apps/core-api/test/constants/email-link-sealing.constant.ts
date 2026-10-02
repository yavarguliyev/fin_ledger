export const EMAIL_LINK_SEALING_TEST = {
  EMAIL: 'sealed-links@support-tests.realtime-wallet-payments.com',
  FORGOT_PATH: '/auth/forgot-password',
  TOKEN_MARKER: 'token=',
  OUTBOX_SQL: `SELECT payload::text AS payload FROM outbox_events
                WHERE event_type = 'email.user.password-reset' AND payload->>'to' = $1 ORDER BY created_at DESC LIMIT 1`,
  SEALED_PREFIX: 'v1:',
  OK: 201
} as const;
