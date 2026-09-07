import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  money: { type: 'bigint', notNull: true, default: 0 },
  currency: { type: 'char(3)', notNull: true },
  varchar_20: { type: 'varchar(20)', notNull: true },
  varchar_50: { type: 'varchar(50)', notNull: true },
  varchar_255: { type: 'varchar(255)' },
  varchar_255_unique: { type: 'varchar(255)', unique: true }
};

export const up = pgm => {
  pgm.createTable('wallet_transactions', {
    id: 'id',
    wallet_id: {
      type: 'uuid',
      notNull: true,
      references: 'wallets(id)',
      onDelete: 'CASCADE'
    },
    type: 'varchar_50',
    amount_minor: 'money',
    currency: 'currency',
    status: 'varchar_20',
    reference: 'varchar_255',
    transaction_id: 'varchar_255_unique',
    ledger_entry_id: {
      type: 'uuid',
      references: 'ledger_entries(id)',
      onDelete: 'SET NULL'
    },
    created_at: 'created_at'
  });

  pgm.createIndex('wallet_transactions', ['wallet_id', 'created_at'], {
    method: 'btree',
    name: 'idx_wallet_transactions_wallet_created'
  });
};

export const down = pgm => {
  pgm.dropTable('wallet_transactions', { cascade: true });
};
