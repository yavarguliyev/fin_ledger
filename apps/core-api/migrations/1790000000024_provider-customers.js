export { shorthands } from './utils/shorthands.js';

const PROVIDERS = ['adyen', 'paypal', 'stripe'];
const STAFF_ROLES = ['ADMIN', 'GLOBAL_ADMIN'];
const TABLE = 'provider_customers';

export const up = pgm => {
  pgm.createTable(TABLE, {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    provider: { type: 'varchar(50)', notNull: true },
    provider_customer_id: { type: 'varchar(255)', notNull: true },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint(TABLE, 'chk_provider_customers_provider', {
    check: `provider IN (${PROVIDERS.map(provider => `'${provider}'`).join(', ')})`
  });
  pgm.addConstraint(TABLE, 'uq_provider_customers_user', { unique: ['provider', 'user_id'] });
  pgm.addConstraint(TABLE, 'uq_provider_customers_external', { unique: ['provider', 'provider_customer_id'] });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE ON ${TABLE} TO app_readwrite;
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
