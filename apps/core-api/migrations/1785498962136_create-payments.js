import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  updated_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  money: { type: 'bigint', notNull: true, default: 0 },
  currency: { type: 'char(3)', notNull: true },
  varchar_20: { type: 'varchar(20)', notNull: true },
  varchar_255_unique: { type: 'varchar(255)', notNull: true, unique: true }
};

export const up = pgm => {
  pgm.createTable('payments', {
    id: 'id',
    idempotency_key: 'varchar_255_unique',
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    wallet_id: {
      type: 'uuid',
      notNull: true,
      references: 'wallets(id)',
      onDelete: 'CASCADE'
    },
    ledger_account_id: {
      type: 'uuid',
      notNull: true,
      references: 'ledger_accounts(id)',
      onDelete: 'CASCADE'
    },
    payment_method_id: {
      type: 'uuid',
      references: 'payment_methods(id)',
      onDelete: 'SET NULL'
    },
    type: 'varchar_20',
    amount_minor: 'money',
    currency: 'currency',
    status: { type: 'payment_status', notNull: true, default: 'PENDING' },
    transaction_id: { type: 'varchar(255)' },
    metadata: { type: 'jsonb' },
    failure_reason: { type: 'text' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('payments', 'user_id', {
    name: 'idx_payments_user_id'
  });

  pgm.createIndex('payments', 'payment_method_id', {
    name: 'idx_payments_payment_method_id'
  });

  pgm.createIndex('payments', 'transaction_id', {
    method: 'hash',
    name: 'idx_payments_transaction_id_hash'
  });

  pgm.createIndex('payments', 'metadata', {
    method: 'gin',
    name: 'idx_payments_metadata_gin'
  });
};

export const down = pgm => {
  pgm.dropTable('payments', { cascade: true });
};
