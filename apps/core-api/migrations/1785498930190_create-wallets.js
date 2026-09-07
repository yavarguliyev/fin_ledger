import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  updated_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  currency: { type: 'char(3)', notNull: true }
};

export const up = pgm => {
  pgm.createTable('wallets', {
    id: 'id',
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    ledger_account_id: {
      type: 'uuid',
      notNull: true,
      references: 'ledger_accounts(id)',
      onDelete: 'CASCADE'
    },
    currency: 'currency',
    available_balance_minor: {
      type: 'bigint',
      notNull: true,
      default: 0,
      check: 'available_balance_minor >= 0'
    },
    reserved_balance_minor: {
      type: 'bigint',
      notNull: true,
      default: 0,
      check: 'reserved_balance_minor >= 0'
    },
    version: { type: 'integer', notNull: true, default: 0 },
    status: { type: 'wallet_status', notNull: true, default: 'ACTIVE' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('wallets', 'user_id', {
    name: 'uq_wallets_one_active_per_user',
    unique: true,
    where: "status = 'ACTIVE'"
  });
};

export const down = pgm => {
  pgm.dropTable('wallets', { cascade: true });
};
