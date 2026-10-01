export { shorthands } from './utils/shorthands.js';
import { addEnumCheck, enumCheckName } from './utils/enum-check.js';

const IMMUTABLE_COLUMNS = [
  'wallet_id',
  'type',
  'amount_minor',
  'currency',
  'balance_after_minor',
  'idempotency_key',
  'ledger_transaction_id',
  'created_at'
];

export const up = pgm => {
  pgm.dropConstraint('outbox_events', enumCheckName({ table: 'outbox_events', column: 'status' }), { ifExists: true });
  addEnumCheck(pgm, { table: 'outbox_events', column: 'status', name: 'outbox_status' });

  pgm.sql(`
    CREATE OR REPLACE FUNCTION forbid_financial_rewrite()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, public
    AS $$
    DECLARE
      v_column text;
    BEGIN
      FOREACH v_column IN ARRAY ARRAY[${IMMUTABLE_COLUMNS.map(column => `'${column}'`).join(', ')}] LOOP
        IF to_jsonb(OLD) -> v_column IS DISTINCT FROM to_jsonb(NEW) -> v_column THEN
          RAISE EXCEPTION 'Column % of % is immutable once written', v_column, TG_TABLE_NAME
            USING ERRCODE = 'check_violation';
        END IF;
      END LOOP;

      RETURN NEW;
    END;
    $$;
  `);

  pgm.sql(`
    CREATE TRIGGER trg_wallet_transactions_no_rewrite
    BEFORE UPDATE ON wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION forbid_financial_rewrite();
  `);

  pgm.createTable('payment_status_history', {
    id: 'id',
    payment_id: { type: 'uuid', notNull: true, references: 'payments(id)', onDelete: 'RESTRICT' },
    from_status: { type: 'text' },
    to_status: { type: 'text', notNull: true },
    source: { type: 'varchar(50)', notNull: true },
    created_at: 'created_at'
  });

  addEnumCheck(pgm, { table: 'payment_status_history', column: 'to_status', name: 'payment_status' });

  pgm.createIndex('payment_status_history', ['payment_id', 'created_at'], { name: 'idx_payment_status_history_payment' });

  pgm.sql(`
    CREATE TRIGGER trg_payment_status_history_immutable
    BEFORE UPDATE OR DELETE ON payment_status_history
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
  `);
};

export const down = pgm => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_payment_status_history_immutable ON payment_status_history;');
  pgm.dropTable('payment_status_history');

  pgm.sql('DROP TRIGGER IF EXISTS trg_wallet_transactions_no_rewrite ON wallet_transactions;');
  pgm.sql('DROP FUNCTION IF EXISTS forbid_financial_rewrite();');

  pgm.dropConstraint('outbox_events', enumCheckName({ table: 'outbox_events', column: 'status' }), { ifExists: true });
  pgm.addConstraint('outbox_events', enumCheckName({ table: 'outbox_events', column: 'status' }), {
    check: "status IN ('PENDING', 'PUBLISHED', 'FAILED', 'DEAD')"
  });
};
