export { shorthands } from './utils/shorthands.js';

const CONVERSATIONS = 'support_conversations';

export const up = pgm => {
  pgm.addColumns(CONVERSATIONS, {
    privacy_enabled: { type: 'boolean', notNull: true, default: false },
    privacy_changed_by: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    privacy_changed_at: { type: 'timestamptz' }
  });
};

export const down = pgm => {
  pgm.dropColumns(CONVERSATIONS, ['privacy_enabled', 'privacy_changed_by', 'privacy_changed_at']);
};
