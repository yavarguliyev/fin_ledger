export { shorthands } from './utils/shorthands.js';

const COLUMN = 'last_message_preview';
const FUNCTION = 'refresh_support_conversation_preview';
const TRIGGER = 'trg_support_messages_preview';

const LATEST_PREVIEW = conversation => `
  SELECT CASE WHEN m.body IS NOT NULL THEN m.body ELSE m.file_name END
    FROM support_messages m
   WHERE m.conversation_id = ${conversation} AND m.deleted_at IS NULL
   ORDER BY m.created_at DESC
   LIMIT 1
`;

export const up = pgm => {
  pgm.addColumn('support_conversations', { [COLUMN]: { type: 'text' } });
  pgm.sql(`UPDATE support_conversations c SET ${COLUMN} = (${LATEST_PREVIEW('c.id')});`);
  pgm.sql(`
    CREATE OR REPLACE FUNCTION ${FUNCTION}()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog, public
    AS $$
    BEGIN
      UPDATE support_conversations SET ${COLUMN} = (${LATEST_PREVIEW('NEW.conversation_id')}) WHERE id = NEW.conversation_id;
      RETURN NULL;
    END;
    $$;

    CREATE TRIGGER ${TRIGGER}
    AFTER INSERT OR UPDATE OF body, file_name, deleted_at ON support_messages
    FOR EACH ROW
    EXECUTE FUNCTION ${FUNCTION}();
  `);
};

export const down = pgm => {
  pgm.sql(`DROP TRIGGER IF EXISTS ${TRIGGER} ON support_messages;`);
  pgm.sql(`DROP FUNCTION IF EXISTS ${FUNCTION}();`);
  pgm.dropColumn('support_conversations', COLUMN);
};
