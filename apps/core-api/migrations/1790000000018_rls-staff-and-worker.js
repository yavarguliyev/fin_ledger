export { shorthands } from './utils/shorthands.js';

const RLS_TABLES = ['wallets', 'wallet_transactions', 'payment_methods', 'payments', 'bets', 'notifications'];
const STAFF_ROLES = ['ADMIN', 'GLOBAL_ADMIN'];

export const up = pgm => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_current_role()
    RETURNS text
    LANGUAGE sql
    STABLE
    SET search_path = pg_catalog, public
    AS $$
      SELECT u.role::text FROM users u WHERE u.id = app_current_user_id();
    $$;
  `);

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_worker_group') THEN
        CREATE ROLE app_worker_group NOLOGIN;
      END IF;
    END $$;

    GRANT app_readwrite TO app_worker_group;

    -- Retention deletes are the worker's job; the API login must not be able to
    -- remove ledger-adjacent history (API-P2-3).
    GRANT DELETE ON outbox_events, webhook_events TO app_worker_group;
  `);

  RLS_TABLES.forEach(table => {
    pgm.sql(`
      CREATE POLICY ${table}_staff_access ON ${table}
        FOR ALL
        TO app_readwrite
        USING (app_current_role() IN (${STAFF_ROLES.map(role => `'${role}'`).join(', ')}))
        WITH CHECK (app_current_role() IN (${STAFF_ROLES.map(role => `'${role}'`).join(', ')}));
    `);
  });
};

export const down = pgm => {
  RLS_TABLES.forEach(table => pgm.sql(`DROP POLICY IF EXISTS ${table}_staff_access ON ${table};`));

  pgm.sql(`
    REVOKE DELETE ON outbox_events, webhook_events FROM app_worker_group;
    REVOKE app_readwrite FROM app_worker_group;
    DROP ROLE IF EXISTS app_worker_group;
  `);

  pgm.sql('DROP FUNCTION IF EXISTS app_current_role();');
};
