export { shorthands } from './utils/shorthands.js';

const STARS = 'support_message_stars';

export const up = pgm => {
  pgm.createTable(STARS, {
    message_id: { type: 'uuid', notNull: true, references: 'support_messages(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    created_at: 'created_at'
  });

  pgm.addConstraint(STARS, 'pk_support_message_stars', { primaryKey: ['message_id', 'user_id'] });
  pgm.createIndex(STARS, ['user_id', 'created_at'], { name: 'idx_support_message_stars_user' });

  pgm.sql(`
    GRANT SELECT, INSERT, DELETE ON ${STARS} TO app_readwrite;
    ALTER TABLE ${STARS} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${STARS}_owner_access ON ${STARS}
      FOR ALL TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());
  `);
};

export const down = pgm => {
  pgm.sql(`DROP POLICY IF EXISTS ${STARS}_owner_access ON ${STARS};`);
  pgm.dropTable(STARS);
};
