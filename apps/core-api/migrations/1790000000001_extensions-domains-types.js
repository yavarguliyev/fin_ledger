export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });
  pgm.createExtension('citext', { ifNotExists: true });
  pgm.createExtension('btree_gist', { ifNotExists: true });

  pgm.sql(`
    CREATE OR REPLACE FUNCTION uuid_generate_v7()
    RETURNS uuid
    LANGUAGE sql
    VOLATILE
    PARALLEL SAFE
    SET search_path = pg_catalog, public
    AS $$
      SELECT encode(
        set_bit(
          set_bit(
            overlay(
              uuid_send(gen_random_uuid())
              placing substring(
                int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint)
                from 3
              )
              from 1 for 6
            ),
            52, 1
          ),
          53, 1
        ),
        'hex'
      )::uuid;
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, public
    AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION bump_row_version()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, public
    AS $$
    BEGIN
      NEW.version = OLD.version + 1;
      RETURN NEW;
    END;
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION forbid_mutation()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, public
    AS $$
    BEGIN
      RAISE EXCEPTION '% is append-only; % is not permitted', TG_TABLE_NAME, TG_OP
        USING ERRCODE = '0A000';
    END;
    $$;
  `);

  pgm.createDomain('currency_code', 'text', { check: "VALUE ~ '^[A-Z]{3}$'" });

  pgm.createDomain('money_minor', 'bigint');
  pgm.createDomain('money_minor_nonneg', 'bigint', { check: 'VALUE >= 0' });
  pgm.createDomain('money_minor_positive', 'bigint', { check: 'VALUE > 0' });

  pgm.createDomain('decimal_odds', 'numeric(12, 4)', { check: 'VALUE > 1' });

  pgm.createDomain('email_address', 'citext', {
    check: "VALUE ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$' AND length(VALUE) <= 320"
  });
};

export const down = pgm => {
  ['email_address', 'decimal_odds', 'money_minor_positive', 'money_minor_nonneg', 'money_minor', 'currency_code'].forEach(domain =>
    pgm.dropDomain(domain, { ifExists: true })
  );

  pgm.sql(`
    DROP FUNCTION IF EXISTS forbid_mutation();
    DROP FUNCTION IF EXISTS bump_row_version();
    DROP FUNCTION IF EXISTS set_updated_at();
    DROP FUNCTION IF EXISTS uuid_generate_v7();
  `);

  pgm.dropExtension('btree_gist', { ifExists: true });
  pgm.dropExtension('citext', { ifExists: true });
  pgm.dropExtension('pgcrypto', { ifExists: true });
};
