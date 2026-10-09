export { shorthands } from './utils/shorthands.js';

const CONVERSATIONS = 'support_conversations';
const PREFERENCES = 'support_conversation_preferences';
const THEMES = ['DEFAULT', 'OCEAN', 'FOREST', 'SUNSET', 'LAVENDER', 'ROSE'];
const THEME_CHECK = `theme IS NULL OR theme IN (${THEMES.map(theme => `'${theme}'`).join(', ')})`;

export const up = pgm => {
  pgm.addColumn(CONVERSATIONS, { theme: { type: 'text' } });
  pgm.addConstraint(CONVERSATIONS, 'chk_support_conversations_theme', { check: THEME_CHECK });

  pgm.sql(`
    UPDATE ${CONVERSATIONS} c
       SET theme = latest.theme
      FROM (
        SELECT DISTINCT ON (conversation_id) conversation_id, theme
          FROM ${PREFERENCES}
         WHERE theme IS NOT NULL
         ORDER BY conversation_id, updated_at DESC
      ) latest
     WHERE latest.conversation_id = c.id
  `);

  pgm.dropConstraint(PREFERENCES, 'chk_support_conversation_preferences_theme');
  pgm.dropColumn(PREFERENCES, 'theme');
};

export const down = pgm => {
  pgm.addColumn(PREFERENCES, { theme: { type: 'text' } });
  pgm.addConstraint(PREFERENCES, 'chk_support_conversation_preferences_theme', { check: THEME_CHECK });

  pgm.sql(`
    UPDATE ${PREFERENCES} p
       SET theme = c.theme
      FROM ${CONVERSATIONS} c
     WHERE c.id = p.conversation_id AND c.theme IS NOT NULL
  `);

  pgm.dropConstraint(CONVERSATIONS, 'chk_support_conversations_theme');
  pgm.dropColumn(CONVERSATIONS, 'theme');
};
