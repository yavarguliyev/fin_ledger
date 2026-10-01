export { shorthands } from './utils/shorthands.js';

const PERIODS = ['DAILY', 'WEEKLY', 'MONTHLY'];
const STAFF_ROLES = ['ADMIN', 'GLOBAL_ADMIN'];
const TABLE = 'deposit_limits';

export const up = pgm => {
  pgm.createTable(TABLE, {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    period: { type: 'text', notNull: true },
    currency: 'currency',
    amount_minor: { type: 'bigint', notNull: true },
    pending_amount_minor: { type: 'bigint' },
    pending_effective_at: { type: 'timestamptz' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint(TABLE, 'chk_deposit_limits_period', { check: `period IN (${PERIODS.map(period => `'${period}'`).join(', ')})` });
  pgm.addConstraint(TABLE, 'chk_deposit_limits_amount', { check: 'amount_minor > 0' });
  pgm.addConstraint(TABLE, 'chk_deposit_limits_pending', {
    check: '(pending_amount_minor IS NULL) = (pending_effective_at IS NULL)'
  });
  pgm.addConstraint(TABLE, 'uq_deposit_limits_user_period', { unique: ['user_id', 'period', 'currency'] });

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
