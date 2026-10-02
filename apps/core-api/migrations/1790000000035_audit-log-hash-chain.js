export { shorthands } from './utils/shorthands.js';

const DIGEST = 'audit_log_digest';
const CHAIN = 'audit_log_chain';
const BREAKS = 'audit_log_chain_breaks';
const TRIGGER = 'trg_audit_log_chain';
const IMMUTABLE_TRIGGER = 'trg_audit_log_immutable';
const SEQ_INDEX = 'uq_audit_log_chain_seq';
const LOCK_KEY = "hashtext('audit_log_chain')";

export const up = pgm => {
  pgm.sql(`
    ALTER TABLE audit_log
      ADD COLUMN chain_seq bigint,
      ADD COLUMN prev_hash bytea,
      ADD COLUMN row_hash bytea;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION ${DIGEST}(prev bytea, r audit_log) RETURNS bytea LANGUAGE sql IMMUTABLE AS $$
      SELECT sha256(coalesce(prev, ''::bytea) || convert_to(jsonb_build_array(
        r.chain_seq, r.id, r.actor_user_id, r.actor_role, r.actor_service, r.action, r.entity_type, r.entity_id,
        r.before_state, r.after_state, r.ip_address::text, r.user_agent, r.request_id,
        (extract(epoch FROM r.created_at) * 1000000)::bigint
      )::text, 'UTF8'));
    $$;
  `);

  pgm.sql(`ALTER TABLE audit_log DISABLE TRIGGER ${IMMUTABLE_TRIGGER};`);

  pgm.sql(`
    DO $$
    DECLARE
      r audit_log;
      seq bigint := 0;
      last_hash bytea;
    BEGIN
      FOR r IN SELECT * FROM audit_log ORDER BY created_at, id LOOP
        seq := seq + 1;
        r.chain_seq := seq;
        r.prev_hash := last_hash;
        r.row_hash := ${DIGEST}(last_hash, r);
        UPDATE audit_log SET chain_seq = r.chain_seq, prev_hash = r.prev_hash, row_hash = r.row_hash WHERE id = r.id;
        last_hash := r.row_hash;
      END LOOP;
    END $$;
  `);

  pgm.sql(`ALTER TABLE audit_log ENABLE TRIGGER ${IMMUTABLE_TRIGGER};`);

  pgm.sql('ALTER TABLE audit_log ALTER COLUMN chain_seq SET NOT NULL, ALTER COLUMN row_hash SET NOT NULL;');
  pgm.sql(`CREATE UNIQUE INDEX ${SEQ_INDEX} ON audit_log (chain_seq);`);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION ${CHAIN}() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE
      last_seq bigint;
      last_hash bytea;
    BEGIN
      PERFORM pg_advisory_xact_lock(${LOCK_KEY});
      SELECT chain_seq, row_hash INTO last_seq, last_hash FROM audit_log ORDER BY chain_seq DESC LIMIT 1;
      NEW.chain_seq := coalesce(last_seq, 0) + 1;
      NEW.prev_hash := last_hash;
      NEW.row_hash := ${DIGEST}(last_hash, NEW);
      RETURN NEW;
    END;
    $$;
  `);

  pgm.sql(`CREATE TRIGGER ${TRIGGER} BEFORE INSERT ON audit_log FOR EACH ROW EXECUTE FUNCTION ${CHAIN}();`);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION ${BREAKS}() RETURNS TABLE (chain_seq bigint, id uuid) LANGUAGE sql STABLE AS $$
      SELECT (c.r).chain_seq, (c.r).id
        FROM (
          SELECT l AS r,
                 lag(l.row_hash) OVER (ORDER BY l.chain_seq) AS expected_prev,
                 lag(l.chain_seq) OVER (ORDER BY l.chain_seq) AS previous_seq
            FROM audit_log l
        ) c
       WHERE (c.r).row_hash IS DISTINCT FROM ${DIGEST}((c.r).prev_hash, c.r)
          OR (c.r).prev_hash IS DISTINCT FROM c.expected_prev
          OR (c.r).chain_seq <> coalesce(c.previous_seq, 0) + 1
       ORDER BY 1;
    $$;
  `);
};

export const down = pgm => {
  pgm.sql(`DROP FUNCTION IF EXISTS ${BREAKS}();`);
  pgm.sql(`DROP TRIGGER IF EXISTS ${TRIGGER} ON audit_log;`);
  pgm.sql(`DROP FUNCTION IF EXISTS ${CHAIN}();`);
  pgm.sql(`DROP INDEX IF EXISTS ${SEQ_INDEX};`);
  pgm.sql(`DROP FUNCTION IF EXISTS ${DIGEST}(bytea, audit_log);`);
  pgm.sql('ALTER TABLE audit_log DROP COLUMN IF EXISTS chain_seq, DROP COLUMN IF EXISTS prev_hash, DROP COLUMN IF EXISTS row_hash;');
};
