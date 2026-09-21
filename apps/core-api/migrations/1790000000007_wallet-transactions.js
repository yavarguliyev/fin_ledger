export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('wallet_transactions', {
    id: 'id',
    wallet_id: { type: 'uuid', notNull: true },

    type: { type: 'wallet_transaction_type', notNull: true },
    status: { type: 'wallet_transaction_status', notNull: true, default: 'PENDING' },

    amount_minor: { type: 'money_minor', notNull: true, check: 'amount_minor <> 0' },
    currency: 'currency',

    balance_after_minor: { type: 'money_minor_nonneg', notNull: true },
    reference: { type: 'varchar(255)' },
    external_reference: { type: 'varchar(255)' },
    idempotency_key: { type: 'varchar(255)', notNull: true },

    ledger_transaction_id: { type: 'uuid', references: 'ledger_transactions(id)', onDelete: 'RESTRICT' },
    created_at: 'created_at'
  });

  pgm.addConstraint('wallet_transactions', 'fk_wallet_transactions_wallet_currency', {
    foreignKeys: {
      columns: ['wallet_id', 'currency'],
      references: 'wallets(id, currency)'
    }
  });

  pgm.addConstraint('wallet_transactions', 'uq_wallet_transactions_idempotency', {
    unique: ['wallet_id', 'idempotency_key']
  });

  pgm.createIndex('wallet_transactions', 'external_reference', {
    name: 'uq_wallet_transactions_external_reference',
    unique: true,
    where: 'external_reference IS NOT NULL'
  });

  pgm.createIndex('wallet_transactions', ['wallet_id', 'created_at'], {
    name: 'idx_wallet_transactions_wallet_created'
  });

  pgm.createIndex('wallet_transactions', 'ledger_transaction_id', {
    name: 'idx_wallet_transactions_ledger_transaction',
    where: 'ledger_transaction_id IS NOT NULL'
  });

  pgm.addConstraint('wallet_transactions', 'chk_wallet_transactions_settled_has_ledger', {
    check: "status <> 'COMPLETED' OR ledger_transaction_id IS NOT NULL"
  });

  pgm.addConstraint('wallet_transactions', 'chk_wallet_transactions_sign', {
    check: `
      (type IN ('DEPOSIT','BET_PAYOUT','BET_REFUND') AND amount_minor > 0)
      OR
      (type IN ('WITHDRAWAL','BET_STAKE','FEE') AND amount_minor < 0)
      OR
      (type = 'ADJUSTMENT')
    `
  });

  pgm.sql(`
    CREATE TRIGGER trg_wallet_transactions_immutable
    BEFORE DELETE ON wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
  `);
};

export const down = pgm => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_wallet_transactions_immutable ON wallet_transactions;');
  pgm.dropTable('wallet_transactions');
};
