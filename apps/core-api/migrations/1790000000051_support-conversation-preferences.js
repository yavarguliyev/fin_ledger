export { shorthands } from './utils/shorthands.js';

const PREFERENCES = 'support_conversation_preferences';
const THEMES = ['DEFAULT', 'OCEAN', 'FOREST', 'SUNSET', 'LAVENDER', 'ROSE'];

export const up = pgm => {
  pgm.createTable(PREFERENCES, {
    conversation_id: { type: 'uuid', notNull: true, references: 'support_conversations(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    muted_until: { type: 'timestamptz' },
    pinned_at: { type: 'timestamptz' },
    favourite: { type: 'boolean', notNull: true, default: false },
    theme: { type: 'text' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.addConstraint(PREFERENCES, 'pk_support_conversation_preferences', { primaryKey: ['conversation_id', 'user_id'] });
  pgm.addConstraint(PREFERENCES, 'chk_support_conversation_preferences_theme', {
    check: `theme IS NULL OR theme IN (${THEMES.map(theme => `'${theme}'`).join(', ')})`
  });
  pgm.createIndex(PREFERENCES, 'user_id', { name: 'idx_support_conversation_preferences_user' });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${PREFERENCES} TO app_readwrite;
    GRANT SELECT ON ${PREFERENCES} TO app_readonly;
    ALTER TABLE ${PREFERENCES} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${PREFERENCES}_owner_access ON ${PREFERENCES}
      FOR ALL TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());
  `);
};

export const down = pgm => {
  pgm.sql(`DROP POLICY IF EXISTS ${PREFERENCES}_owner_access ON ${PREFERENCES};`);
  pgm.dropTable(PREFERENCES);
};
