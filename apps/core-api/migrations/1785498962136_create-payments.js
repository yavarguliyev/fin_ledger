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
    provider: { type: 'varchar(50)', notNull: true, default: 'local' },
    provider_charge_id: { type: 'varchar(255)' },
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

  pgm.createIndex('payments', ['provider', 'provider_charge_id'], {
    name: 'idx_payments_provider_charge'
  });

  pgm.createIndex('payments', 'transaction_id', {
    method: 'hash',
    name: 'idx_payments_transaction_id_hash'
  });

  pgm.createIndex('payments', 'metadata', {
    method: 'gin',
    name: 'idx_payments_metadata_gin'
  });

  pgm.createTable('webhook_events', {
    id: 'id',
    event_id: { type: 'varchar(255)', notNull: true },
    provider: { type: 'varchar(50)', notNull: true },
    event_type: { type: 'varchar(100)', notNull: true },
    payload: { type: 'jsonb', notNull: true },
    status: { type: 'varchar(50)', notNull: true, default: 'PROCESSED' },
    created_at: 'created_at'
  });

  pgm.addConstraint('webhook_events', 'uq_webhook_events_provider_event_id', {
    unique: ['provider', 'event_id']
  });

  pgm.createIndex('webhook_events', ['provider', 'event_id'], {
    name: 'idx_webhook_events_provider_event'
  });
};

export const down = pgm => {
  pgm.dropTable('webhook_events', { cascade: true });
  pgm.dropTable('payments', { cascade: true });
};
