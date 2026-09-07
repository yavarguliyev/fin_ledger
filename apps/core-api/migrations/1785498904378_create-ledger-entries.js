import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  money: { type: 'bigint', notNull: true, default: 0 },
  currency: { type: 'char(3)', notNull: true },
  varchar_255: { type: 'varchar(255)' },
  int: { type: 'integer', notNull: true }
};

export const up = pgm => {
  pgm.createTable('ledger_entries', {
    id: 'id',
    transaction_id: { type: 'uuid', notNull: true },
    account_id: {
      type: 'uuid',
      notNull: true,
      references: 'ledger_accounts(id)',
      onDelete: 'CASCADE'
    },
    entry_type: { type: 'entry_type', notNull: true },
    amount_minor: 'money',
    currency: 'currency',
    description: { type: 'text', notNull: true },
    reference: 'varchar_255',
    sequence: 'int',
    created_at: 'created_at'
  });

  pgm.createIndex('ledger_entries', 'transaction_id', {
    method: 'btree',
    name: 'idx_ledger_entries_transaction_id'
  });

  pgm.createIndex('ledger_entries', 'account_id', {
    method: 'btree',
    name: 'idx_ledger_entries_account_id'
  });

  pgm.createIndex('ledger_entries', 'created_at', {
    method: 'brin',
    name: 'idx_ledger_entries_created_at_brin'
  });
};

export const down = pgm => {
  pgm.dropTable('ledger_entries', { cascade: true });
};
