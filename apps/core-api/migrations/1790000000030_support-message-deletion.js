export { shorthands } from './utils/shorthands.js';

const MESSAGES = 'support_messages';
const HIDDEN = 'support_hidden_messages';
const CONTENT_CHECK = 'chk_support_messages_has_content';

export const up = pgm => {
  pgm.dropConstraint(MESSAGES, CONTENT_CHECK);
  pgm.addConstraint(MESSAGES, CONTENT_CHECK, { check: 'deleted_at IS NOT NULL OR body IS NOT NULL OR storage_key IS NOT NULL' });

  pgm.createTable(HIDDEN, {
    message_id: { type: 'uuid', notNull: true, references: `${MESSAGES}(id)`, onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    created_at: 'created_at'
  });
  pgm.addConstraint(HIDDEN, 'pk_support_hidden_messages', { primaryKey: ['message_id', 'user_id'] });
  pgm.createIndex(HIDDEN, 'user_id', { name: 'idx_support_hidden_messages_user' });

  pgm.sql(`
    GRANT SELECT, INSERT, DELETE ON ${HIDDEN} TO app_readwrite;
    GRANT SELECT ON ${HIDDEN} TO app_readonly;
    ALTER TABLE ${HIDDEN} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${HIDDEN}_owner_access ON ${HIDDEN}
      FOR ALL TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());
  `);
};

export const down = pgm => {
  pgm.sql(`DROP POLICY IF EXISTS ${HIDDEN}_owner_access ON ${HIDDEN};`);
  pgm.dropTable(HIDDEN);
  pgm.sql(`UPDATE ${MESSAGES} SET body = '' WHERE deleted_at IS NOT NULL AND body IS NULL AND storage_key IS NULL;`);
  pgm.dropConstraint(MESSAGES, CONTENT_CHECK);
  pgm.addConstraint(MESSAGES, CONTENT_CHECK, { check: 'body IS NOT NULL OR storage_key IS NOT NULL' });
};
