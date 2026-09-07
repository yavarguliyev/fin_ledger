export const shorthands = {};

export const up = pgm => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createType('wallet_status', ['ACTIVE', 'SUSPENDED', 'CLOSED']);
  pgm.createType('payment_status', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'COMPENSATED']);
  pgm.createType('account_type', ['LIABILITY', 'ASSET', 'REVENUE', 'EXPENSE']);
  pgm.createType('entry_type', ['DEBIT', 'CREDIT']);
  pgm.createType('notification_status', ['PENDING', 'SENT', 'FAILED', 'READ']);
  pgm.createType('outbox_status', ['PENDING', 'PUBLISHED', 'FAILED']);
  pgm.createType('event_status', ['LIVE', 'UPCOMING', 'FINISHED', 'CANCELLED']);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION uuid_generate_v7()
    RETURNS uuid
    AS $$
      SELECT encode(
        set_bit(
          set_bit(
            overlay(
              uuid_send(gen_random_uuid())
              placing substring(
                int8send(
                  floor(extract(epoch from clock_timestamp()) * 1000)::bigint
                )
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
    $$
    LANGUAGE SQL
    VOLATILE;
  `);
};

export const down = pgm => {
  pgm.dropType('event_status', { ifExists: true });
  pgm.dropType('outbox_status', { ifExists: true });
  pgm.dropType('notification_status', { ifExists: true });
  pgm.dropType('entry_type', { ifExists: true });
  pgm.dropType('account_type', { ifExists: true });
  pgm.dropType('payment_status', { ifExists: true });
  pgm.dropType('wallet_status', { ifExists: true });

  pgm.sql('DROP FUNCTION IF EXISTS uuid_generate_v7();');

  pgm.dropExtension('pgcrypto', { ifExists: true });
};
