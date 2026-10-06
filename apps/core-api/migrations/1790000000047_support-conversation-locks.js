export { shorthands } from './utils/shorthands.js';

const LOCKS = 'support_conversation_locks';

export const up = pgm => {
  pgm.createTable(LOCKS, {
    conversation_id: { type: 'uuid', notNull: true, references: 'support_conversations(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    unlocked_until: { type: 'timestamptz' },
    created_at: 'created_at'
  });

  pgm.addConstraint(LOCKS, 'pk_support_conversation_locks', { primaryKey: ['conversation_id', 'user_id'] });
  pgm.createIndex(LOCKS, 'user_id', { name: 'idx_support_conversation_locks_user' });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${LOCKS} TO app_readwrite;
    GRANT SELECT ON ${LOCKS} TO app_readonly;
    ALTER TABLE ${LOCKS} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${LOCKS}_owner_access ON ${LOCKS}
      FOR ALL TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());
  `);
};

export const down = pgm => {
  pgm.sql(`DROP POLICY IF EXISTS ${LOCKS}_owner_access ON ${LOCKS};`);
  pgm.dropTable(LOCKS);
};
