import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  updated_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  money: { type: 'bigint', notNull: true, default: 0 },
  currency: { type: 'char(3)', notNull: true }
};

export const up = pgm => {
  pgm.createTable('ledger_accounts', {
    id: 'id',
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    account_type: { type: 'account_type', notNull: true },
    currency: 'currency',
    balance_minor: 'money',
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('ledger_accounts', ['user_id', 'account_type', 'currency'], {
    method: 'btree',
    name: 'idx_ledger_accounts_user_type_currency'
  });
};

export const down = pgm => {
  pgm.dropTable('ledger_accounts', { cascade: true });
};
