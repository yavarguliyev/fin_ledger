export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('wallets', {
    id: 'id',

    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'RESTRICT'
    },

    ledger_account_id: { type: 'uuid', notNull: true },
    currency: 'currency',

    available_balance_minor: { type: 'money_minor_nonneg', notNull: true, default: 0 },
    reserved_balance_minor: { type: 'money_minor_nonneg', notNull: true, default: 0 },

    version: { type: 'integer', notNull: true, default: 0 },
    status: { type: 'wallet_status', notNull: true, default: 'ACTIVE' },

    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint('wallets', 'fk_wallets_ledger_account_currency', {
    foreignKeys: { columns: ['ledger_account_id', 'currency'], references: 'ledger_accounts(id, currency)' }
  });

  pgm.addConstraint('wallets', 'fk_wallets_currency', {
    foreignKeys: { columns: 'currency', references: 'currencies(code)' }
  });

  pgm.addConstraint('wallets', 'uq_wallets_user_currency', { unique: ['user_id', 'currency'] });
  pgm.createIndex('wallets', 'ledger_account_id', { name: 'uq_wallets_ledger_account', unique: true });

  pgm.addConstraint('wallets', 'uq_wallets_id_currency', { unique: ['id', 'currency'] });

  pgm.addConstraint('wallets', 'chk_wallets_closed_is_empty', {
    check: "status <> 'CLOSED' OR (available_balance_minor = 0 AND reserved_balance_minor = 0)"
  });

  pgm.sql(`
    CREATE TRIGGER trg_wallets_bump_version
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION bump_row_version();
  `);

  pgm.sql(`
    CREATE OR REPLACE VIEW v_wallet_ledger_drift AS
    SELECT w.id AS wallet_id,
           w.user_id,
           w.currency,
           w.available_balance_minor + w.reserved_balance_minor AS wallet_total_minor,
           a.balance_minor AS ledger_balance_minor
    FROM wallets w
    JOIN ledger_accounts a ON a.id = w.ledger_account_id
    WHERE w.available_balance_minor + w.reserved_balance_minor <> a.balance_minor;
  `);
};

export const down = pgm => {
  pgm.sql('DROP VIEW IF EXISTS v_wallet_ledger_drift;');
  pgm.dropTable('wallets');
};
