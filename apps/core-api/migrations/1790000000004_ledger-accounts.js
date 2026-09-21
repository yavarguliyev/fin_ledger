export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('ledger_accounts', {
    id: 'id',
    owner_type: { type: 'account_owner_type', notNull: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    code: { type: 'varchar(64)' },
    account_type: { type: 'account_type', notNull: true },
    currency: 'currency',
    balance_minor: { type: 'money_minor', notNull: true, default: 0 },
    is_active: { type: 'boolean', notNull: true, default: true },
    version: { type: 'integer', notNull: true, default: 0 },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint('ledger_accounts', 'fk_ledger_accounts_currency', { foreignKeys: { columns: 'currency', references: 'currencies(code)' } });

  pgm.addConstraint('ledger_accounts', 'chk_ledger_accounts_owner', {
    check: `
      (owner_type = 'USER'   AND user_id IS NOT NULL AND code IS NULL)
      OR
      (owner_type = 'SYSTEM' AND user_id IS NULL     AND code IS NOT NULL)
    `
  });

  pgm.createIndex('ledger_accounts', ['user_id', 'account_type', 'currency'], {
    name: 'uq_ledger_accounts_user_type_currency',
    unique: true,
    where: 'user_id IS NOT NULL'
  });

  pgm.createIndex('ledger_accounts', 'code', {
    name: 'uq_ledger_accounts_code',
    unique: true,
    where: 'code IS NOT NULL'
  });

  pgm.addConstraint('ledger_accounts', 'uq_ledger_accounts_id_currency', { unique: ['id', 'currency'] });

  pgm.sql(`
    INSERT INTO ledger_accounts (owner_type, code, account_type, currency)
    SELECT 'SYSTEM', 'HOUSE_CASH_' || c.code, 'ASSET', c.code
    FROM currencies c
    WHERE c.is_active
    ON CONFLICT DO NOTHING;
  `);
};

export const down = pgm => {
  pgm.dropTable('ledger_accounts');
};
