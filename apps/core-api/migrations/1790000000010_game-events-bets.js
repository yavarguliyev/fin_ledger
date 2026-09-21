export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('game_events', {
    id: 'id',

    external_ref: { type: 'varchar(128)' },
    provider: { type: 'varchar(50)' },

    sport: { type: 'varchar(50)', notNull: true },
    competition: { type: 'varchar(100)' },
    label: { type: 'varchar(255)', notNull: true, check: 'length(btrim(label)) > 0' },

    odds: { type: 'decimal_odds', notNull: true },

    status: { type: 'event_status', notNull: true, default: 'SCHEDULED' },

    starts_at: { type: 'timestamptz', notNull: true },
    betting_closes_at: { type: 'timestamptz' },
    settled_at: { type: 'timestamptz' },
    result: { type: 'varchar(50)' },

    version: { type: 'integer', notNull: true, default: 0 },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('game_events', ['provider', 'external_ref'], {
    name: 'uq_game_events_provider_external_ref',
    unique: true,
    where: 'external_ref IS NOT NULL'
  });

  pgm.createIndex('game_events', ['status', 'starts_at'], { name: 'idx_game_events_status_starts_at' });

  pgm.createIndex('game_events', 'starts_at', {
    name: 'idx_game_events_open',
    where: "status IN ('SCHEDULED','LIVE')"
  });

  pgm.createIndex('game_events', ['sport', 'starts_at'], { name: 'idx_game_events_sport_starts_at' });

  pgm.addConstraint('game_events', 'chk_game_events_betting_close', {
    check: 'betting_closes_at IS NULL OR betting_closes_at <= starts_at'
  });

  pgm.addConstraint('game_events', 'chk_game_events_settled', {
    check: "(status = 'SETTLED') = (settled_at IS NOT NULL AND result IS NOT NULL)"
  });

  pgm.createTable('bets', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    wallet_id: { type: 'uuid', notNull: true },
    currency: 'currency',
    event_id: { type: 'uuid', notNull: true, references: 'game_events(id)', onDelete: 'RESTRICT' },

    selection: { type: 'varchar(100)', notNull: true },
    stake_minor: 'money_positive',

    odds_at_placement: { type: 'decimal_odds', notNull: true },
    potential_payout_minor: 'money_positive',

    status: { type: 'bet_status', notNull: true, default: 'PENDING' },
    payout_minor: { type: 'money_minor_nonneg' },

    idempotency_key: { type: 'varchar(255)', notNull: true },

    stake_ledger_transaction_id: {
      type: 'uuid',
      notNull: true,
      references: 'ledger_transactions(id)',
      onDelete: 'RESTRICT'
    },

    settlement_ledger_transaction_id: {
      type: 'uuid',
      references: 'ledger_transactions(id)',
      onDelete: 'RESTRICT'
    },

    placed_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    settled_at: { type: 'timestamptz' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint('bets', 'fk_bets_wallet_currency', {
    foreignKeys: { columns: ['wallet_id', 'currency'], references: 'wallets(id, currency)' }
  });

  pgm.addConstraint('bets', 'uq_bets_user_idempotency', { unique: ['user_id', 'idempotency_key'] });

  pgm.createIndex('bets', ['user_id', 'placed_at'], { name: 'idx_bets_user_placed' });
  pgm.createIndex('bets', ['event_id', 'status'], { name: 'idx_bets_event_status' });

  pgm.createIndex('bets', 'event_id', {
    name: 'idx_bets_unsettled',
    where: "status = 'PENDING'"
  });

  pgm.createIndex('bets', 'placed_at', { name: 'idx_bets_placed_at_brin', method: 'brin' });

  pgm.addConstraint('bets', 'chk_bets_settled_consistency', {
    check: `
      (status = 'PENDING' AND settled_at IS NULL AND payout_minor IS NULL
        AND settlement_ledger_transaction_id IS NULL)
      OR
      (status <> 'PENDING' AND settled_at IS NOT NULL AND payout_minor IS NOT NULL)
    `
  });

  pgm.addConstraint('bets', 'chk_bets_lost_pays_nothing', {
    check: "status <> 'LOST' OR payout_minor = 0"
  });

  pgm.addConstraint('bets', 'chk_bets_void_refunds_stake', {
    check: "status <> 'VOIDED' OR payout_minor = stake_minor"
  });

  pgm.addConstraint('bets', 'chk_bets_potential_payout_matches_odds', {
    check: 'abs(potential_payout_minor::numeric - (stake_minor::numeric * odds_at_placement)) <= 1'
  });
};

export const down = pgm => {
  pgm.dropTable('bets');
  pgm.dropTable('game_events');
};
