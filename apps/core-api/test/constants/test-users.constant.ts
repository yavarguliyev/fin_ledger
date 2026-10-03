export const TEST_USERS = {
  DOMAIN: '@support-tests.realtime-wallet-payments.com',
  DEFAULT_ROLE: 'USER',
  ID_BY_EMAIL_SQL: 'SELECT id FROM users WHERE email = $1',
  ARGON2_OPTIONS: { memoryCost: 65536, timeCost: 3, parallelism: 4 },
  CREATE_SQL: `
    INSERT INTO users (email, display_name, password_hash, password_algo, password_changed_at, role, status, is_email_verified, email_verified_at)
    SELECT t.email, split_part(t.email, '@', 1), $2, 'argon2id', now(), $3, 'ACTIVE', true, now()
      FROM unnest($1::text[]) AS t(email)
     WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = t.email)
  `
} as const;
