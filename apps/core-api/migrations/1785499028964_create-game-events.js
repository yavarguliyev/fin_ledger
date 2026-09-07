import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  updated_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') }
};

export const up = pgm => {
  pgm.createTable('game_events', {
    id: 'id',
    label: { type: 'varchar(255)', notNull: true },
    odds: {
      type: 'decimal(10,2)',
      notNull: true,
      check: 'odds > 0'
    },
    status: { type: 'event_status', notNull: true, default: 'UPCOMING' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('game_events', ['status', 'created_at'], {
    method: 'btree',
    name: 'idx_game_events_status_created'
  });
};

export const down = pgm => {
  pgm.dropTable('game_events', { cascade: true });
};
