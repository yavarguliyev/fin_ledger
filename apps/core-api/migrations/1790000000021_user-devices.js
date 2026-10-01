export { shorthands } from './utils/shorthands.js';

const RLS_TABLES = ['user_devices', 'login_events'];
const STAFF_ROLES = ['ADMIN', 'GLOBAL_ADMIN'];

export const up = pgm => {
  pgm.createTable('user_devices', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    visitor_id: { type: 'text', notNull: true },
    user_agent: { type: 'text' },
    last_ip: { type: 'inet' },
    first_seen_at: 'created_at',
    last_seen_at: 'created_at'
  });

  pgm.addConstraint('user_devices', 'uq_user_devices_user_visitor', { unique: ['user_id', 'visitor_id'] });
  pgm.createIndex('user_devices', 'visitor_id', { name: 'idx_user_devices_visitor' });

  pgm.createTable('login_events', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    visitor_id: { type: 'text' },
    user_agent: { type: 'text' },
    ip: { type: 'inet' },
    is_new_device: { type: 'boolean', notNull: true, default: false },
    created_at: 'created_at'
  });

  pgm.createIndex('login_events', ['user_id', 'created_at'], { name: 'idx_login_events_recent' });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE ON user_devices, login_events TO app_readwrite;
    GRANT SELECT ON user_devices, login_events TO app_readonly;
  `);

  RLS_TABLES.forEach(table => {
    pgm.sql(`
      ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;

      CREATE POLICY ${table}_owner_access ON ${table}
        FOR ALL
        TO app_readwrite
        USING (user_id = app_current_user_id())
        WITH CHECK (user_id = app_current_user_id());

      CREATE POLICY ${table}_staff_access ON ${table}
        FOR ALL
        TO app_readwrite
        USING (app_current_role() IN (${STAFF_ROLES.map(role => `'${role}'`).join(', ')}))
        WITH CHECK (app_current_role() IN (${STAFF_ROLES.map(role => `'${role}'`).join(', ')}));
    `);
  });
};

export const down = pgm => {
  RLS_TABLES.forEach(table => {
    pgm.sql(`
      DROP POLICY IF EXISTS ${table}_staff_access ON ${table};
      DROP POLICY IF EXISTS ${table}_owner_access ON ${table};
      ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;
    `);
  });

  pgm.dropTable('login_events');
  pgm.dropTable('user_devices');
};
