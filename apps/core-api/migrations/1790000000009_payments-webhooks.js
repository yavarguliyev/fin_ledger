export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('payments', {
    id: 'id',

    idempotency_key: { type: 'varchar(255)', notNull: true },

    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    wallet_id: { type: 'uuid', notNull: true },
    currency: 'currency',

    payment_method_id: {
      type: 'uuid',
      references: 'payment_methods(id)',
      onDelete: 'RESTRICT'
    },

    type: { type: 'payment_type', notNull: true },
    status: { type: 'payment_status', notNull: true, default: 'PENDING' },

    amount_minor: 'money_positive',
    fee_minor: { type: 'money_minor_nonneg', notNull: true, default: 0 },

    provider: { type: 'varchar(50)', notNull: true },
    provider_charge_id: { type: 'varchar(255)' },

    ledger_transaction_id: {
      type: 'uuid',
      references: 'ledger_transactions(id)',
      onDelete: 'RESTRICT'
    },

    metadata: { type: 'jsonb', check: "metadata IS NULL OR jsonb_typeof(metadata) = 'object'" },

    failure_code: { type: 'varchar(50)' },
    failure_reason: { type: 'text' },

    authorized_at: { type: 'timestamptz' },
    completed_at: { type: 'timestamptz' },
    failed_at: { type: 'timestamptz' },

    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint('payments', 'fk_payments_wallet_currency', {
    foreignKeys: { columns: ['wallet_id', 'currency'], references: 'wallets(id, currency)' }
  });

  pgm.addConstraint('payments', 'uq_payments_user_idempotency', {
    unique: ['user_id', 'idempotency_key']
  });

  pgm.createIndex('payments', ['provider', 'provider_charge_id'], {
    name: 'uq_payments_provider_charge',
    unique: true,
    where: 'provider_charge_id IS NOT NULL'
  });

  pgm.createIndex('payments', ['user_id', 'created_at'], { name: 'idx_payments_user_created' });

  pgm.createIndex('payments', ['status', 'created_at'], {
    name: 'idx_payments_pending',
    where: "status IN ('PENDING','PROCESSING','REQUIRES_ACTION')"
  });

  pgm.createIndex('payments', 'payment_method_id', {
    name: 'idx_payments_payment_method_id',
    where: 'payment_method_id IS NOT NULL'
  });

  pgm.createIndex('payments', 'created_at', { name: 'idx_payments_created_at_brin', method: 'brin' });

  pgm.addConstraint('payments', 'chk_payments_completed_has_ledger', {
    check: "status <> 'COMPLETED' OR (ledger_transaction_id IS NOT NULL AND completed_at IS NOT NULL)"
  });

  pgm.addConstraint('payments', 'chk_payments_failed_has_reason', {
    check: "status <> 'FAILED' OR (failed_at IS NOT NULL AND failure_code IS NOT NULL)"
  });

  pgm.addConstraint('payments', 'chk_payments_withdrawal_needs_method', {
    check: "type <> 'WITHDRAWAL' OR payment_method_id IS NOT NULL"
  });

  pgm.createTable('webhook_events', {
    id: 'id',
    provider: { type: 'varchar(50)', notNull: true },
    event_id: { type: 'varchar(255)', notNull: true },
    event_type: { type: 'varchar(100)', notNull: true },
    payload: { type: 'jsonb', notNull: true },

    status: { type: 'webhook_status', notNull: true, default: 'RECEIVED' },

    signature_verified: { type: 'boolean', notNull: true, default: false },

    attempts: { type: 'smallint', notNull: true, default: 0 },
    last_error: { type: 'text' },
    received_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    processed_at: { type: 'timestamptz' },
    created_at: 'created_at'
  });

  pgm.addConstraint('webhook_events', 'uq_webhook_events_provider_event_id', {
    unique: ['provider', 'event_id']
  });

  pgm.createIndex('webhook_events', 'received_at', {
    name: 'idx_webhook_events_unprocessed',
    where: "status IN ('RECEIVED','FAILED')"
  });

  pgm.addConstraint('webhook_events', 'chk_webhook_events_processed_at', {
    check: "(status = 'PROCESSED') = (processed_at IS NOT NULL)"
  });
};

export const down = pgm => {
  pgm.dropTable('webhook_events');
  pgm.dropTable('payments');
};
