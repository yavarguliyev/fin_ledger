export { shorthands } from './utils/shorthands.js';

const STAFF_ROLES = ['GLOBAL_ADMIN', 'ADMIN', 'MODERATOR'];
const CONVERSATIONS = 'support_conversations';
const MESSAGES = 'support_messages';
const RECEIPTS = 'support_read_receipts';

const CONVERSATION_STATUSES = ['OPEN', 'RESOLVED', 'CLOSED'];
const MESSAGE_KINDS = ['TEXT', 'IMAGE', 'FILE', 'VOICE', 'SYSTEM'];
const MESSAGE_SOURCES = ['WEB', 'TELEGRAM', 'SYSTEM'];

const quoted = values => values.map(value => `'${value}'`).join(', ');
const staffCheck = `app_current_role() IN (${quoted(STAFF_ROLES)})`;
const ownsConversation = `EXISTS (SELECT 1 FROM ${CONVERSATIONS} c WHERE c.id = conversation_id AND c.customer_user_id = app_current_user_id())`;

export const up = pgm => {
  pgm.createTable(CONVERSATIONS, {
    id: 'id',
    customer_user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    assigned_staff_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    subject: { type: 'varchar(200)' },
    status: { type: 'text', notNull: true, default: 'OPEN' },
    last_message_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint(CONVERSATIONS, 'chk_support_conversations_status', { check: `status IN (${quoted(CONVERSATION_STATUSES)})` });
  pgm.createIndex(CONVERSATIONS, 'customer_user_id', { name: 'uq_support_conversations_open_per_customer', unique: true, where: "status = 'OPEN'" });
  pgm.createIndex(CONVERSATIONS, ['status', 'last_message_at'], { name: 'idx_support_conversations_queue' });
  pgm.createIndex(CONVERSATIONS, 'assigned_staff_id', { name: 'idx_support_conversations_assignee', where: 'assigned_staff_id IS NOT NULL' });

  pgm.createTable(MESSAGES, {
    id: 'id',
    conversation_id: { type: 'uuid', notNull: true, references: `${CONVERSATIONS}(id)`, onDelete: 'CASCADE' },
    sender_user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    kind: { type: 'text', notNull: true, default: 'TEXT' },
    source: { type: 'text', notNull: true, default: 'WEB' },
    body: { type: 'text' },
    storage_key: { type: 'text' },
    file_name: { type: 'varchar(255)' },
    mime_type: { type: 'varchar(100)' },
    size_bytes: { type: 'bigint', check: 'size_bytes IS NULL OR size_bytes > 0' },
    duration_seconds: { type: 'integer', check: 'duration_seconds IS NULL OR duration_seconds > 0' },
    external_id: { type: 'varchar(100)' },
    edited_at: { type: 'timestamptz' },
    deleted_at: { type: 'timestamptz' },
    created_at: 'created_at'
  });

  pgm.addConstraint(MESSAGES, 'chk_support_messages_kind', { check: `kind IN (${quoted(MESSAGE_KINDS)})` });
  pgm.addConstraint(MESSAGES, 'chk_support_messages_source', { check: `source IN (${quoted(MESSAGE_SOURCES)})` });
  pgm.addConstraint(MESSAGES, 'chk_support_messages_has_content', { check: 'body IS NOT NULL OR storage_key IS NOT NULL' });
  pgm.addConstraint(MESSAGES, 'chk_support_messages_attachment_complete', {
    check: 'storage_key IS NULL OR (mime_type IS NOT NULL AND size_bytes IS NOT NULL)'
  });

  pgm.createIndex(MESSAGES, ['conversation_id', 'created_at'], { name: 'idx_support_messages_thread' });
  pgm.createIndex(MESSAGES, ['source', 'external_id'], { name: 'uq_support_messages_external', unique: true, where: 'external_id IS NOT NULL' });

  pgm.createTable(RECEIPTS, {
    conversation_id: { type: 'uuid', notNull: true, references: `${CONVERSATIONS}(id)`, onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    last_read_message_id: { type: 'uuid', references: `${MESSAGES}(id)`, onDelete: 'SET NULL' },
    last_read_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: 'updated_at'
  });

  pgm.addConstraint(RECEIPTS, 'pk_support_read_receipts', { primaryKey: ['conversation_id', 'user_id'] });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${CONVERSATIONS}, ${MESSAGES}, ${RECEIPTS} TO app_readwrite;
    GRANT SELECT ON ${CONVERSATIONS}, ${MESSAGES}, ${RECEIPTS} TO app_readonly;

    ALTER TABLE ${CONVERSATIONS} ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ${MESSAGES} ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ${RECEIPTS} ENABLE ROW LEVEL SECURITY;

    CREATE POLICY ${CONVERSATIONS}_owner_access ON ${CONVERSATIONS}
      FOR ALL TO app_readwrite
      USING (customer_user_id = app_current_user_id())
      WITH CHECK (customer_user_id = app_current_user_id());

    CREATE POLICY ${CONVERSATIONS}_staff_access ON ${CONVERSATIONS}
      FOR ALL TO app_readwrite
      USING (${staffCheck})
      WITH CHECK (${staffCheck});

    CREATE POLICY ${MESSAGES}_owner_access ON ${MESSAGES}
      FOR ALL TO app_readwrite
      USING (${ownsConversation})
      WITH CHECK (${ownsConversation} AND sender_user_id = app_current_user_id());

    CREATE POLICY ${MESSAGES}_staff_access ON ${MESSAGES}
      FOR ALL TO app_readwrite
      USING (${staffCheck})
      WITH CHECK (${staffCheck});

    CREATE POLICY ${RECEIPTS}_owner_access ON ${RECEIPTS}
      FOR ALL TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());

    CREATE POLICY ${RECEIPTS}_staff_access ON ${RECEIPTS}
      FOR ALL TO app_readwrite
      USING (${staffCheck})
      WITH CHECK (${staffCheck});
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP POLICY IF EXISTS ${RECEIPTS}_staff_access ON ${RECEIPTS};
    DROP POLICY IF EXISTS ${RECEIPTS}_owner_access ON ${RECEIPTS};
    DROP POLICY IF EXISTS ${MESSAGES}_staff_access ON ${MESSAGES};
    DROP POLICY IF EXISTS ${MESSAGES}_owner_access ON ${MESSAGES};
    DROP POLICY IF EXISTS ${CONVERSATIONS}_staff_access ON ${CONVERSATIONS};
    DROP POLICY IF EXISTS ${CONVERSATIONS}_owner_access ON ${CONVERSATIONS};
  `);

  pgm.dropTable(RECEIPTS);
  pgm.dropTable(MESSAGES);
  pgm.dropTable(CONVERSATIONS);
};
