import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  currency: { type: 'char(3)', notNull: true },
  money: { type: 'bigint', notNull: true, default: 0 }
};

export const up = pgm => {
  pgm.createTable('fx_rates', {
    id: 'id',
    base_currency: 'currency',
    quote_currency: 'currency',
    rate: { type: 'numeric(30, 15)', notNull: true, check: 'rate > 0' },
    provider: { type: 'varchar(100)', notNull: true },
    quoted_at: { type: 'timestamptz', notNull: true },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: 'created_at'
  });

  pgm.addConstraint('fx_rates', 'chk_fx_rates_distinct_currencies', { check: 'base_currency <> quote_currency' });
  pgm.addConstraint('fx_rates', 'chk_fx_rates_expiry', { check: 'expires_at > quoted_at' });
  pgm.createIndex('fx_rates', ['base_currency', 'quote_currency', 'quoted_at'], {
    name: 'idx_fx_rates_currency_pair_quoted_at',
    method: 'btree'
  });

  pgm.createTable('wallet_currency_conversions', {
    id: 'id',
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    source_wallet_id: {
      type: 'uuid',
      notNull: true,
      references: 'wallets(id)',
      onDelete: 'CASCADE'
    },
    target_wallet_id: {
      type: 'uuid',
      notNull: true,
      references: 'wallets(id)',
      onDelete: 'CASCADE'
    },
    source_ledger_account_id: {
      type: 'uuid',
      notNull: true,
      references: 'ledger_accounts(id)',
      onDelete: 'CASCADE'
    },
    target_ledger_account_id: {
      type: 'uuid',
      notNull: true,
      references: 'ledger_accounts(id)',
      onDelete: 'CASCADE'
    },
    source_currency: 'currency',
    target_currency: 'currency',
    source_amount_minor: { type: 'bigint', notNull: true, check: 'source_amount_minor >= 0' },
    target_amount_minor: { type: 'bigint', notNull: true, check: 'target_amount_minor >= 0' },
    fee_amount_minor: 'money',
    fee_currency: 'currency',
    fx_rate_id: {
      type: 'uuid',
      notNull: true,
      references: 'fx_rates(id)',
      onDelete: 'RESTRICT'
    },
    rate: { type: 'numeric(30, 15)', notNull: true, check: 'rate > 0' },
    rate_provider: { type: 'varchar(100)', notNull: true },
    idempotency_key: { type: 'varchar(255)', notNull: true, unique: true },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'COMPLETED',
      check: "status IN ('COMPLETED', 'FAILED')"
    },
    created_at: 'created_at'
  });

  pgm.addConstraint('wallet_currency_conversions', 'chk_wallet_currency_conversions_distinct_currencies', {
    check: 'source_currency <> target_currency'
  });

  pgm.createIndex('wallet_currency_conversions', ['user_id', 'created_at'], {
    name: 'idx_wallet_currency_conversions_user_created_at',
    method: 'btree'
  });

  pgm.createIndex('wallet_currency_conversions', 'source_wallet_id', {
    name: 'idx_wallet_currency_conversions_source_wallet',
    method: 'btree'
  });

  pgm.createIndex('wallet_currency_conversions', 'target_wallet_id', {
    name: 'idx_wallet_currency_conversions_target_wallet',
    method: 'btree'
  });

  pgm.addColumn('wallet_transactions', {
    conversion_id: {
      type: 'uuid',
      references: 'wallet_currency_conversions(id)',
      onDelete: 'CASCADE'
    }
  });

  pgm.createIndex('wallet_transactions', 'conversion_id', {
    name: 'idx_wallet_transactions_conversion',
    method: 'btree'
  });
};

export const down = pgm => {
  pgm.dropIndex('wallet_transactions', 'conversion_id', { name: 'idx_wallet_transactions_conversion' });
  pgm.dropColumn('wallet_transactions', 'conversion_id');
  pgm.dropTable('wallet_currency_conversions');
  pgm.dropTable('fx_rates');
};
