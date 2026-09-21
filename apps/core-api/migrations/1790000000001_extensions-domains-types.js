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

  pgm.createType('user_role', ['GLOBAL_ADMIN', 'ADMIN', 'MODERATOR', 'USER']);
  pgm.createType('user_status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED']);

  pgm.createType('account_type', ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']);
  pgm.createType('account_owner_type', ['USER', 'SYSTEM']);
  pgm.createType('entry_type', ['DEBIT', 'CREDIT']);

  pgm.createType('wallet_status', ['ACTIVE', 'SUSPENDED', 'CLOSED']);

  pgm.createType('wallet_transaction_type', [
    'DEPOSIT',
    'WITHDRAWAL',
    'BET_STAKE',
    'BET_PAYOUT',
    'BET_REFUND',
    'FEE',
    'ADJUSTMENT'
  ]);

  pgm.createType('wallet_transaction_status', ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED']);

  pgm.createType('payment_type', ['DEPOSIT', 'WITHDRAWAL', 'REFUND', 'CHARGEBACK']);
  pgm.createType('payment_status', ['PENDING', 'PROCESSING', 'REQUIRES_ACTION', 'COMPLETED', 'FAILED', 'CANCELLED', 'COMPENSATED']);
  pgm.createType('payment_method_type', ['BANK_ACCOUNT', 'CREDIT_CARD', 'DEBIT_CARD', 'APPLE_PAY', 'GOOGLE_PAY']);
  pgm.createType('payment_method_status', ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'REMOVED']);

  pgm.createType('event_status', ['SCHEDULED', 'LIVE', 'FINISHED', 'SETTLED', 'CANCELLED', 'POSTPONED']);
  pgm.createType('bet_status', ['PENDING', 'WON', 'LOST', 'VOIDED', 'CASHED_OUT']);

  pgm.createType('notification_channel', ['IN_APP', 'EMAIL', 'SMS', 'PUSH']);
  pgm.createType('notification_status', ['PENDING', 'SENT', 'FAILED', 'READ']);

  pgm.createType('outbox_status', ['PENDING', 'PUBLISHED', 'FAILED', 'DEAD']);
  pgm.createType('webhook_status', ['RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED']);
};

export const down = pgm => {
  [
    'webhook_status',
    'outbox_status',
    'notification_status',
    'notification_channel',
    'bet_status',
    'event_status',
    'payment_method_status',
    'payment_method_type',
    'payment_status',
    'payment_type',
    'wallet_transaction_status',
    'wallet_transaction_type',
    'wallet_status',
    'entry_type',
    'account_owner_type',
    'account_type',
    'user_status',
    'user_role'
  ].forEach(type => pgm.dropType(type, { ifExists: true }));

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
