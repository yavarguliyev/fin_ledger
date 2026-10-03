export { shorthands } from './utils/shorthands.js';

const MESSAGES = 'support_messages';
const REACTIONS = 'support_message_reactions';
const STAFF_ROLES = "ARRAY['GLOBAL_ADMIN', 'ADMIN', 'MODERATOR']";

export const up = pgm => {
  pgm.createTable(REACTIONS, {
    message_id: { type: 'uuid', notNull: true, references: `${MESSAGES}(id)`, onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    emoji: { type: 'varchar(16)', notNull: true },
    created_at: 'created_at'
  });
  pgm.addConstraint(REACTIONS, 'pk_support_message_reactions', { primaryKey: ['message_id', 'user_id'] });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${REACTIONS} TO app_readwrite;
    GRANT SELECT ON ${REACTIONS} TO app_readonly;
    ALTER TABLE ${REACTIONS} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${REACTIONS}_owner_access ON ${REACTIONS}
      FOR ALL TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());
    CREATE POLICY ${REACTIONS}_participant_read ON ${REACTIONS}
      FOR SELECT TO app_readwrite
      USING (EXISTS (
        SELECT 1 FROM ${MESSAGES} m JOIN support_conversations c ON c.id = m.conversation_id
         WHERE m.id = ${REACTIONS}.message_id AND c.customer_user_id = app_current_user_id()
      ));
    CREATE POLICY ${REACTIONS}_staff_read ON ${REACTIONS}
      FOR SELECT TO app_readwrite
      USING (app_current_role() = ANY (${STAFF_ROLES}));
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP POLICY IF EXISTS ${REACTIONS}_staff_read ON ${REACTIONS};
    DROP POLICY IF EXISTS ${REACTIONS}_participant_read ON ${REACTIONS};
    DROP POLICY IF EXISTS ${REACTIONS}_owner_access ON ${REACTIONS};
  `);
  pgm.dropTable(REACTIONS);
};
