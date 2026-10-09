export { shorthands } from './utils/shorthands.js';

const PINS = 'support_pinned_messages';
const STAFF_ROLES = "ARRAY['GLOBAL_ADMIN', 'ADMIN', 'MODERATOR']";

export const up = pgm => {
  pgm.createTable(PINS, {
    message_id: { type: 'uuid', notNull: true, primaryKey: true, references: 'support_messages(id)', onDelete: 'CASCADE' },
    conversation_id: { type: 'uuid', notNull: true, references: 'support_conversations(id)', onDelete: 'CASCADE' },
    pinned_by: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: 'created_at'
  });

  pgm.createIndex(PINS, ['conversation_id', 'expires_at'], { name: 'idx_support_pinned_messages_conversation' });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${PINS} TO app_readwrite;
    GRANT SELECT ON ${PINS} TO app_readonly;
    ALTER TABLE ${PINS} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${PINS}_participant_access ON ${PINS}
      FOR ALL TO app_readwrite
      USING (EXISTS (
        SELECT 1 FROM support_conversations c
         WHERE c.id = ${PINS}.conversation_id
           AND (c.customer_user_id = app_current_user_id() OR c.assigned_staff_id = app_current_user_id())
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM support_conversations c
         WHERE c.id = ${PINS}.conversation_id
           AND (c.customer_user_id = app_current_user_id() OR c.assigned_staff_id = app_current_user_id())
      ));
    CREATE POLICY ${PINS}_staff_access ON ${PINS}
      FOR ALL TO app_readwrite
      USING (app_current_role() = ANY (${STAFF_ROLES}))
      WITH CHECK (app_current_role() = ANY (${STAFF_ROLES}));
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP POLICY IF EXISTS ${PINS}_staff_access ON ${PINS};
    DROP POLICY IF EXISTS ${PINS}_participant_access ON ${PINS};
  `);
  pgm.dropTable(PINS);
};
