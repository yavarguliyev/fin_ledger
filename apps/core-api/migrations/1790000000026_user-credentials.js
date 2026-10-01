export { shorthands } from './utils/shorthands.js';

const STAFF_ROLES = ['ADMIN', 'GLOBAL_ADMIN'];
const TABLE = 'user_credentials';

export const up = pgm => {
  pgm.createTable(TABLE, {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    credential_id: { type: 'text', notNull: true },
    public_key: { type: 'text', notNull: true },
    sign_count: { type: 'bigint', notNull: true, default: 0, check: 'sign_count >= 0' },
    transports: { type: 'text[]', notNull: true, default: '{}' },
    device_label: { type: 'varchar(100)' },
    backed_up: { type: 'boolean', notNull: true, default: false },
    last_used_at: { type: 'timestamptz' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint(TABLE, 'uq_user_credentials_credential_id', { unique: ['credential_id'] });
  pgm.createIndex(TABLE, 'user_id', { name: 'idx_user_credentials_user' });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${TABLE} TO app_readwrite;
    GRANT SELECT ON ${TABLE} TO app_readonly;

    ALTER TABLE ${TABLE} ENABLE ROW LEVEL SECURITY;

    CREATE POLICY ${TABLE}_owner_access ON ${TABLE}
      FOR ALL
      TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());

    CREATE POLICY ${TABLE}_staff_access ON ${TABLE}
      FOR ALL
      TO app_readwrite
      USING (app_current_role() IN (${STAFF_ROLES.map(role => `'${role}'`).join(', ')}))
      WITH CHECK (app_current_role() IN (${STAFF_ROLES.map(role => `'${role}'`).join(', ')}));
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP POLICY IF EXISTS ${TABLE}_staff_access ON ${TABLE};
    DROP POLICY IF EXISTS ${TABLE}_owner_access ON ${TABLE};
    ALTER TABLE ${TABLE} DISABLE ROW LEVEL SECURITY;
  `);

  pgm.dropTable(TABLE);
};
