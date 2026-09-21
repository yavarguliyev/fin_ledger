export { shorthands } from './utils/shorthands.js';

const RLS_TABLES = ['wallets', 'wallet_transactions', 'payment_methods', 'payments', 'bets', 'notifications'];

export const up = pgm => {
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_readwrite') THEN
        CREATE ROLE app_readwrite NOLOGIN;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_readonly') THEN
        CREATE ROLE app_readonly NOLOGIN;
      END IF;
    END $$;
  `);

  pgm.sql(`
    -- Nobody creates objects in public by default. This is the default from
    -- PostgreSQL 15 on, but say it explicitly so older clusters match.
    REVOKE CREATE ON SCHEMA public FROM PUBLIC;

    GRANT USAGE ON SCHEMA public TO app_readwrite, app_readonly;

    GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;

    -- Deliberately no DELETE for the application role anywhere. Removals are
    -- soft deletes or reversing entries; hard deletes are an operator action.

    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE ON TABLES TO app_readwrite;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT ON TABLES TO app_readonly;
  `);

  pgm.sql(`
    REVOKE ALL ON users FROM app_readonly;
    GRANT SELECT (
      id, display_name, role, status, is_email_verified, country_code,
      kyc_status, created_at, updated_at, deleted_at, last_login_at
    ) ON users TO app_readonly;

    REVOKE ALL ON payment_methods FROM app_readonly;
    GRANT SELECT (
      id, user_id, type, status, provider, last_four, card_brand,
      bank_name, is_default, created_at, updated_at
    ) ON payment_methods TO app_readonly;
  `);

  RLS_TABLES.forEach(table => {
    const userColumn = table === 'wallet_transactions' ? '(SELECT w.user_id FROM wallets w WHERE w.id = wallet_id)' : 'user_id';

    // No FORCE, and no "app.current_user_id IS NULL" bypass. The table owner is
    // exempt, which is how migrations, background jobs and today's application
    // connection keep working. For app_readwrite the policy is unconditional:
    // if the GUC is unset the row set is empty, so a missing SET LOCAL fails
    // closed instead of silently exposing every row.
    pgm.sql(`
      ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;

      CREATE POLICY ${table}_owner_access ON ${table}
        FOR ALL
        TO app_readwrite
        USING (${userColumn} = app_current_user_id())
        WITH CHECK (${userColumn} = app_current_user_id());
    `);
  });
};

export const down = pgm => {
  RLS_TABLES.forEach(table => {
    pgm.sql(`
      DROP POLICY IF EXISTS ${table}_owner_access ON ${table};
      ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;
    `);
  });

  pgm.sql(`
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM app_readonly;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT, INSERT, UPDATE ON TABLES FROM app_readwrite;
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_readwrite, app_readonly;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM app_readwrite;
    REVOKE USAGE ON SCHEMA public FROM app_readwrite, app_readonly;
  `);
};
