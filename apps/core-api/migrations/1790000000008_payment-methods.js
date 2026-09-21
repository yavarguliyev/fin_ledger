export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('payment_methods', {
    id: 'id',

    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'RESTRICT'
    },

    type: { type: 'payment_method_type', notNull: true },
    status: { type: 'payment_method_status', notNull: true, default: 'PENDING_VERIFICATION' },

    provider: { type: 'varchar(50)', notNull: true },
    provider_method_id: { type: 'varchar(255)', notNull: true },

    account_holder: { type: 'varchar(100)', notNull: true },

    last_four: { type: 'char(4)', check: "last_four ~ '^[0-9]{4}$'" },
    bank_name: { type: 'varchar(100)' },
    card_brand: { type: 'varchar(30)' },
    wallet_type: { type: 'varchar(30)' },

    expiry_month: { type: 'smallint', check: 'expiry_month BETWEEN 1 AND 12' },
    expiry_year: { type: 'smallint', check: 'expiry_year BETWEEN 2020 AND 2100' },

    fingerprint: { type: 'varchar(128)' },

    is_default: { type: 'boolean', notNull: true, default: false },
    verified_at: { type: 'timestamptz' },
    failure_reason: { type: 'text' },

    metadata: { type: 'jsonb', check: "metadata IS NULL OR jsonb_typeof(metadata) = 'object'" },

    deleted_at: { type: 'timestamptz' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('payment_methods', ['user_id', 'status'], {
    name: 'idx_payment_methods_user_status',
    where: 'deleted_at IS NULL'
  });

  pgm.createIndex('payment_methods', ['provider', 'provider_method_id'], {
    name: 'uq_payment_methods_provider_method',
    unique: true
  });

  pgm.createIndex('payment_methods', 'user_id', {
    name: 'uq_payment_methods_one_default_per_user',
    unique: true,
    where: 'is_default AND deleted_at IS NULL'
  });

  pgm.createIndex('payment_methods', ['user_id', 'fingerprint'], {
    name: 'uq_payment_methods_user_fingerprint',
    unique: true,
    where: 'fingerprint IS NOT NULL AND deleted_at IS NULL'
  });

  pgm.addConstraint('payment_methods', 'chk_payment_methods_card_fields', {
    check: `
      (type IN ('CREDIT_CARD','DEBIT_CARD')
        AND last_four IS NOT NULL AND expiry_month IS NOT NULL AND expiry_year IS NOT NULL)
      OR
      (type = 'BANK_ACCOUNT' AND last_four IS NOT NULL)
      OR
      (type IN ('APPLE_PAY','GOOGLE_PAY'))
    `
  });

  pgm.addConstraint('payment_methods', 'chk_payment_methods_verified_consistency', {
    check: "(status = 'VERIFIED') = (verified_at IS NOT NULL)"
  });

  pgm.addConstraint('payment_methods', 'chk_payment_methods_default_requires_verified', {
    check: "is_default = false OR status = 'VERIFIED'"
  });

  pgm.addConstraint('payment_methods', 'chk_payment_methods_removed_consistency', {
    check: "(status = 'REMOVED') = (deleted_at IS NOT NULL)"
  });

  pgm.sql(`
    CREATE OR REPLACE FUNCTION check_payment_method_user_role()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, public
    AS $$
    DECLARE
      v_role user_role;
    BEGIN
      SELECT role INTO v_role FROM users WHERE id = NEW.user_id;

      IF v_role IS DISTINCT FROM 'USER' THEN
        RAISE EXCEPTION 'Role % may not hold payment methods', v_role
          USING ERRCODE = '23514';
      END IF;

      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER trg_check_payment_method_user_role
    BEFORE INSERT OR UPDATE OF user_id ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION check_payment_method_user_role();
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_check_payment_method_user_role ON payment_methods;
    DROP FUNCTION IF EXISTS check_payment_method_user_role();
  `);

  pgm.dropTable('payment_methods');
};
