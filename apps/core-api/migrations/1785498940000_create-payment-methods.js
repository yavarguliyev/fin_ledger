import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  updated_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  varchar_100: { type: 'varchar(100)', notNull: true }
};

export const up = pgm => {
  pgm.createType('payment_method_type', ['BANK_ACCOUNT', 'DEBIT_CARD']);
  pgm.createType('payment_method_status', ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'REMOVED']);

  pgm.createTable('payment_methods', {
    id: 'id',
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    type: { type: 'payment_method_type', notNull: true },
    account_holder: 'varchar_100',
    masked_account: { type: 'varchar(20)', notNull: true },
    bank_name: { type: 'varchar(100)' },
    status: { type: 'payment_method_status', notNull: true, default: 'PENDING_VERIFICATION' },
    is_default: { type: 'boolean', notNull: true, default: false },
    metadata: { type: 'jsonb' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('payment_methods', 'user_id', {
    name: 'idx_payment_methods_user_id'
  });

  pgm.createIndex('payment_methods', ['user_id', 'status'], {
    name: 'idx_payment_methods_user_status'
  });

  pgm.sql(`
    CREATE OR REPLACE FUNCTION check_payment_method_user_role()
    RETURNS TRIGGER AS $$
    DECLARE
      v_user_role text;
    BEGIN
      SELECT role INTO v_user_role
      FROM users
      WHERE id = NEW.user_id;

      IF v_user_role IN ('global admin', 'admin', 'moderator') THEN
        RAISE EXCEPTION 'Admin roles (%, %, %) cannot have payment methods', 
          'global admin', 'admin', 'moderator';
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_check_payment_method_user_role
    BEFORE INSERT OR UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION check_payment_method_user_role();
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_check_payment_method_user_role ON payment_methods;
    DROP FUNCTION IF EXISTS check_payment_method_user_role();
  `);
  pgm.dropTable('payment_methods', { cascade: true });
  pgm.dropType('payment_method_status', { ifExists: true });
  pgm.dropType('payment_method_type', { ifExists: true });
};
