import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  updated_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  varchar_50: { type: 'varchar(50)', notNull: true },
  varchar_100: { type: 'varchar(100)', notNull: true }
};

export const up = pgm => {
  pgm.createTable('notifications', {
    id: 'id',
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    type: 'varchar_50',
    title: 'varchar_100',
    content: { type: 'text', notNull: true },
    status: { type: 'notification_status', notNull: true, default: 'PENDING' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('notifications', ['user_id', 'status'], {
    method: 'btree',
    name: 'idx_notifications_user_status'
  });
};

export const down = pgm => {
  pgm.dropTable('notifications', { cascade: true });
};
