import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') }
};

export const up = pgm => {
  pgm.createTable('outbox_events', {
    id: 'id',
    aggregate_type: { type: 'varchar(100)', notNull: true },
    aggregate_id: { type: 'uuid', notNull: true },
    event_type: { type: 'varchar(100)', notNull: true },
    payload: { type: 'jsonb', notNull: true },
    status: { type: 'outbox_status', notNull: true, default: 'PENDING' },
    created_at: 'created_at',
    published_at: { type: 'timestamptz' }
  });

  pgm.createIndex('outbox_events', 'created_at', {
    method: 'btree',
    name: 'idx_outbox_events_pending_created',
    where: "status = 'PENDING'"
  });

  pgm.createIndex('outbox_events', 'payload', {
    method: 'gin',
    name: 'idx_outbox_events_payload_gin'
  });
};

export const down = pgm => {
  pgm.dropTable('outbox_events', { cascade: true });
};
