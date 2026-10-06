export { shorthands } from './utils/shorthands.js';

const LINKS = 'support_message_links';
const CONVERSATIONS = 'support_conversations';
const URLS_FUNCTION = 'support_message_urls';
const REFRESH_FUNCTION = 'refresh_support_message_links';
const TRIGGER = 'trg_support_messages_links';
const STAFF_ROLES = ['GLOBAL_ADMIN', 'ADMIN', 'MODERATOR'];
const MAX_LINKS = 20;
const MAX_LENGTH = 2048;

const quoted = values => values.map(value => `'${value}'`).join(', ');
const ownsConversation = `EXISTS (SELECT 1 FROM ${CONVERSATIONS} c WHERE c.id = conversation_id AND c.customer_user_id = app_current_user_id())`;

const INSERT_LINKS = (message, conversation, body, createdAt) => `
  INSERT INTO ${LINKS} (message_id, conversation_id, url, created_at)
  SELECT ${message}, ${conversation}, url, ${createdAt}
    FROM ${URLS_FUNCTION}(${body}) AS url
  ON CONFLICT (message_id, url) DO NOTHING
`;

export const up = pgm => {
  pgm.createTable(LINKS, {
    id: 'id',
    message_id: { type: 'uuid', notNull: true, references: 'support_messages(id)', onDelete: 'CASCADE' },
    conversation_id: { type: 'uuid', notNull: true, references: `${CONVERSATIONS}(id)`, onDelete: 'CASCADE' },
    url: { type: 'text', notNull: true, check: `length(url) <= ${MAX_LENGTH}` },
    created_at: { type: 'timestamptz', notNull: true }
  });

  pgm.addConstraint(LINKS, 'uq_support_message_links_message_url', { unique: ['message_id', 'url'] });
  pgm.createIndex(LINKS, ['conversation_id', { name: 'created_at', sort: 'DESC' }, { name: 'id', sort: 'DESC' }], {
    name: 'idx_support_message_links_conversation'
  });

  pgm.sql(`
    CREATE OR REPLACE FUNCTION ${URLS_FUNCTION}(body text)
    RETURNS SETOF text
    LANGUAGE sql
    IMMUTABLE
    SET search_path = pg_catalog, public
    AS $$
      SELECT DISTINCT url
        FROM (
          SELECT regexp_replace(found[1], '[]).,;:!?}''"]+$', '') AS url
            FROM regexp_matches(coalesce(body, ''), '(https?://[^[:space:]<>"''\`]+)', 'gi') AS found
        ) urls
       WHERE length(url) <= ${MAX_LENGTH}
       LIMIT ${MAX_LINKS};
    $$;

    CREATE OR REPLACE FUNCTION ${REFRESH_FUNCTION}()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog, public
    AS $$
    BEGIN
      DELETE FROM ${LINKS} WHERE message_id = NEW.id;
      IF NEW.deleted_at IS NULL THEN
        ${INSERT_LINKS('NEW.id', 'NEW.conversation_id', 'NEW.body', 'NEW.created_at')};
      END IF;
      RETURN NULL;
    END;
    $$;

    CREATE TRIGGER ${TRIGGER}
    AFTER INSERT OR UPDATE OF body, deleted_at ON support_messages
    FOR EACH ROW
    EXECUTE FUNCTION ${REFRESH_FUNCTION}();
  `);

  pgm.sql(`
    INSERT INTO ${LINKS} (message_id, conversation_id, url, created_at)
    SELECT m.id, m.conversation_id, url, m.created_at
      FROM support_messages m
     CROSS JOIN LATERAL ${URLS_FUNCTION}(m.body) AS url
     WHERE m.deleted_at IS NULL AND m.body IS NOT NULL
    ON CONFLICT (message_id, url) DO NOTHING;
  `);

  pgm.sql(`
    GRANT SELECT ON ${LINKS} TO app_readwrite, app_readonly;
    ALTER TABLE ${LINKS} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${LINKS}_owner_access ON ${LINKS}
      FOR SELECT TO app_readwrite
      USING (${ownsConversation});
    CREATE POLICY ${LINKS}_staff_access ON ${LINKS}
      FOR SELECT TO app_readwrite
      USING (app_current_role() IN (${quoted(STAFF_ROLES)}));
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS ${TRIGGER} ON support_messages;
    DROP FUNCTION IF EXISTS ${REFRESH_FUNCTION}();
    DROP FUNCTION IF EXISTS ${URLS_FUNCTION}(text);
    DROP POLICY IF EXISTS ${LINKS}_staff_access ON ${LINKS};
    DROP POLICY IF EXISTS ${LINKS}_owner_access ON ${LINKS};
  `);
  pgm.dropTable(LINKS);
};
