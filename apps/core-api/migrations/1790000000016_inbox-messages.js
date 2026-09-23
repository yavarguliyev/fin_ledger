export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('inbox_messages', {
    consumer: { type: 'varchar(150)', notNull: true },
    message_id: { type: 'varchar(255)', notNull: true },
    topic: { type: 'varchar(150)', notNull: true },
    processed_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') }
  });

  pgm.addConstraint('inbox_messages', 'pk_inbox_messages', {
    primaryKey: ['consumer', 'message_id']
  });

  pgm.createIndex('inbox_messages', 'processed_at', {
    name: 'idx_inbox_messages_processed_at'
  });
};

export const down = pgm => {
  pgm.dropTable('inbox_messages');
};
