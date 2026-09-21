export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('notifications', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },

    channel: { type: 'notification_channel', notNull: true, default: 'IN_APP' },
    type: { type: 'varchar(50)', notNull: true },
    title: { type: 'varchar(200)', notNull: true },
    content: { type: 'text', notNull: true },
    data: { type: 'jsonb', check: "data IS NULL OR jsonb_typeof(data) = 'object'" },

    status: { type: 'notification_status', notNull: true, default: 'PENDING' },

    dedupe_key: { type: 'varchar(255)' },

    attempts: { type: 'smallint', notNull: true, default: 0 },
    last_error: { type: 'text' },
    sent_at: { type: 'timestamptz' },
    read_at: { type: 'timestamptz' },

    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('notifications', 'dedupe_key', {
    name: 'uq_notifications_dedupe_key',
    unique: true,
    where: 'dedupe_key IS NOT NULL'
  });

  pgm.sql(`
    CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, created_at DESC)
    WHERE status <> 'READ';
  `);

  pgm.createIndex('notifications', ['user_id', 'created_at'], { name: 'idx_notifications_user_created' });

  pgm.createIndex('notifications', 'created_at', {
    name: 'idx_notifications_pending',
    where: "status = 'PENDING'"
  });

  pgm.addConstraint('notifications', 'chk_notifications_read_consistency', {
    check: "(status = 'READ') = (read_at IS NOT NULL)"
  });

  pgm.addConstraint('notifications', 'chk_notifications_sent_at', {
    check: "status NOT IN ('SENT','READ') OR sent_at IS NOT NULL"
  });

  pgm.createTable('outbox_events', {
    id: 'id',
    aggregate_type: { type: 'varchar(100)', notNull: true },
    aggregate_id: { type: 'uuid', notNull: true },
    event_type: { type: 'varchar(100)', notNull: true },

    aggregate_version: { type: 'bigint', notNull: true, check: 'aggregate_version > 0' },
    payload: { type: 'jsonb', notNull: true, check: "jsonb_typeof(payload) = 'object'" },

    trace_id: { type: 'varchar(64)' },
    status: { type: 'outbox_status', notNull: true, default: 'PENDING' },

    attempts: { type: 'smallint', notNull: true, default: 0, check: 'attempts >= 0' },
    max_attempts: { type: 'smallint', notNull: true, default: 10 },
    available_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    last_error: { type: 'text' },

    locked_by: { type: 'varchar(100)' },
    locked_until: { type: 'timestamptz' },

    created_at: 'created_at',
    published_at: { type: 'timestamptz' }
  });

  pgm.addConstraint('outbox_events', 'uq_outbox_aggregate_version', {
    unique: ['aggregate_type', 'aggregate_id', 'aggregate_version']
  });

  pgm.sql(`
    CREATE INDEX idx_outbox_events_dispatch
    ON outbox_events (available_at, id)
    WHERE status = 'PENDING';
  `);

  pgm.createIndex('outbox_events', ['aggregate_type', 'aggregate_id'], {
    name: 'idx_outbox_events_aggregate'
  });

  pgm.createIndex('outbox_events', 'created_at', {
    name: 'idx_outbox_events_dead',
    where: "status = 'DEAD'"
  });

  pgm.addConstraint('outbox_events', 'chk_outbox_published_at', {
    check: "(status = 'PUBLISHED') = (published_at IS NOT NULL)"
  });

  pgm.sql(`
    CREATE TRIGGER trg_outbox_events_immutable_payload
    BEFORE DELETE ON outbox_events
    FOR EACH ROW
    WHEN (OLD.status = 'PENDING')
    EXECUTE FUNCTION forbid_mutation();
  `);
};

export const down = pgm => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_outbox_events_immutable_payload ON outbox_events;');
  pgm.dropTable('outbox_events');
  pgm.dropTable('notifications');
};
