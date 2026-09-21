export { shorthands } from './utils/shorthands.js';

const UPDATED_AT_TABLES = [
  'currencies',
  'users',
  'ledger_accounts',
  'wallets',
  'payment_methods',
  'payments',
  'game_events',
  'bets',
  'notifications'
];

export const up = pgm => {
  UPDATED_AT_TABLES.forEach(table => {
    pgm.sql(`
      CREATE TRIGGER trg_${table}_set_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      WHEN (OLD.* IS DISTINCT FROM NEW.*)
      EXECUTE FUNCTION set_updated_at();
    `);
  });

  pgm.createTable('audit_log', {
    id: 'id',
    actor_user_id: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    actor_role: { type: 'user_role' },
    actor_service: { type: 'varchar(100)' },

    action: { type: 'varchar(100)', notNull: true },
    entity_type: { type: 'varchar(100)', notNull: true },
    entity_id: { type: 'uuid' },

    before_state: { type: 'jsonb' },
    after_state: { type: 'jsonb' },

    ip_address: { type: 'inet' },
    user_agent: { type: 'text' },
    request_id: { type: 'varchar(64)' },

    created_at: 'created_at'
  });

  pgm.createIndex('audit_log', ['entity_type', 'entity_id', 'created_at'], {
    name: 'idx_audit_log_entity'
  });

  pgm.createIndex('audit_log', ['actor_user_id', 'created_at'], {
    name: 'idx_audit_log_actor',
    where: 'actor_user_id IS NOT NULL'
  });

  pgm.createIndex('audit_log', 'created_at', { name: 'idx_audit_log_created_at_brin', method: 'brin' });

  pgm.addConstraint('audit_log', 'chk_audit_log_actor_present', {
    check: 'actor_user_id IS NOT NULL OR actor_service IS NOT NULL'
  });

  pgm.sql(`
    CREATE TRIGGER trg_audit_log_immutable
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_current_user_id()
    RETURNS uuid
    LANGUAGE sql
    STABLE
    SET search_path = pg_catalog, public
    AS $$
      SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
    $$;
  `);
};

export const down = pgm => {
  pgm.sql('DROP FUNCTION IF EXISTS app_current_user_id();');
  pgm.sql('DROP TRIGGER IF EXISTS trg_audit_log_immutable ON audit_log;');
  pgm.dropTable('audit_log');

  UPDATED_AT_TABLES.forEach(table => {
    pgm.sql(`DROP TRIGGER IF EXISTS trg_${table}_set_updated_at ON ${table};`);
  });
};
