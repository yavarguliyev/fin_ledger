export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('ledger_transactions', {
    id: 'id',
    reference_type: { type: 'varchar(50)', notNull: true },
    reference_id: { type: 'uuid' },
    description: { type: 'text', notNull: true, check: 'length(btrim(description)) > 0' },

    idempotency_key: { type: 'varchar(255)', notNull: true },
    actor_user_id: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    reverses_transaction_id: { type: 'uuid', references: 'ledger_transactions(id)', onDelete: 'RESTRICT' },

    effective_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    created_at: 'created_at'
  });

  pgm.addConstraint('ledger_transactions', 'uq_ledger_transactions_idempotency_key', { unique: ['idempotency_key'] });

  pgm.createIndex('ledger_transactions', ['reference_type', 'reference_id'], { name: 'idx_ledger_transactions_reference' });
  pgm.createIndex('ledger_transactions', 'created_at', { name: 'idx_ledger_transactions_created_at_brin', method: 'brin' });

  pgm.createTable('ledger_entries', {
    id: 'id',

    transaction_id: {
      type: 'uuid',
      notNull: true,
      references: 'ledger_transactions(id)',
      onDelete: 'RESTRICT'
    },

    account_id: { type: 'uuid', notNull: true },
    entry_type: { type: 'entry_type', notNull: true },

    amount_minor: 'money_positive',
    currency: 'currency',
    description: { type: 'text', notNull: true },
    reference: { type: 'varchar(255)' },
    sequence: { type: 'integer', notNull: true, check: 'sequence > 0' },
    created_at: 'created_at'
  });

  pgm.addConstraint('ledger_entries', 'fk_ledger_entries_account_currency', {
    foreignKeys: { columns: ['account_id', 'currency'], references: 'ledger_accounts(id, currency)' }
  });

  pgm.addConstraint('ledger_entries', 'uq_ledger_entries_txn_sequence', { unique: ['transaction_id', 'sequence'] });

  pgm.createIndex('ledger_entries', ['account_id', 'created_at'], { name: 'idx_ledger_entries_account_created' });
  pgm.createIndex('ledger_entries', 'transaction_id', { name: 'idx_ledger_entries_transaction_id' });
  pgm.createIndex('ledger_entries', 'created_at', { name: 'idx_ledger_entries_created_at_brin', method: 'brin' });

  pgm.sql(`
    CREATE OR REPLACE FUNCTION assert_ledger_transaction_balanced()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, public
    AS $$
    DECLARE
      v_row      record;
      v_total    integer := 0;
    BEGIN
      FOR v_row IN
        SELECT currency,
               SUM(CASE WHEN entry_type = 'DEBIT' THEN amount_minor ELSE -amount_minor END) AS net,
               COUNT(*) AS leg_count
        FROM ledger_entries
        WHERE transaction_id = NEW.transaction_id
        GROUP BY currency
      LOOP
        v_total := v_total + v_row.leg_count;

        IF v_row.net <> 0 THEN
          RAISE EXCEPTION
            'Unbalanced ledger transaction % in %: debits minus credits = %',
            NEW.transaction_id, v_row.currency, v_row.net
            USING ERRCODE = '23514';
        END IF;

        IF v_row.leg_count < 2 THEN
          RAISE EXCEPTION
            'Ledger transaction % has a single % leg; every posting needs at least one debit and one credit',
            NEW.transaction_id, v_row.currency
            USING ERRCODE = '23514';
        END IF;
      END LOOP;

      IF v_total = 0 THEN
        RAISE EXCEPTION 'Ledger transaction % has no entries', NEW.transaction_id
          USING ERRCODE = '23514';
      END IF;

      RETURN NULL;
    END;
    $$;

    CREATE CONSTRAINT TRIGGER trg_ledger_entries_balanced
    AFTER INSERT ON ledger_entries
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION assert_ledger_transaction_balanced();
  `);

  pgm.sql(`
    CREATE TRIGGER trg_ledger_entries_immutable
    BEFORE UPDATE OR DELETE ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

    CREATE TRIGGER trg_ledger_transactions_immutable
    BEFORE UPDATE OR DELETE ON ledger_transactions
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION apply_ledger_entry_to_balance()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, public
    AS $$
    DECLARE
      v_account_type account_type;
      v_signed       bigint;
    BEGIN
      SELECT account_type INTO v_account_type
      FROM ledger_accounts
      WHERE id = NEW.account_id
      FOR UPDATE;

      IF v_account_type IN ('ASSET', 'EXPENSE') THEN
        v_signed := CASE WHEN NEW.entry_type = 'DEBIT' THEN NEW.amount_minor ELSE -NEW.amount_minor END;
      ELSE
        v_signed := CASE WHEN NEW.entry_type = 'CREDIT' THEN NEW.amount_minor ELSE -NEW.amount_minor END;
      END IF;

      UPDATE ledger_accounts
      SET balance_minor = balance_minor + v_signed
      WHERE id = NEW.account_id;

      RETURN NULL;
    END;
    $$;

    CREATE TRIGGER trg_ledger_entries_apply_balance
    AFTER INSERT ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION apply_ledger_entry_to_balance();
  `);

  pgm.sql(`
    CREATE OR REPLACE VIEW v_ledger_balance_drift AS
    SELECT a.id                AS account_id,
           a.code,
           a.user_id,
           a.currency,
           a.balance_minor     AS cached_balance_minor,
           COALESCE(SUM(
             CASE
               WHEN a.account_type IN ('ASSET','EXPENSE')
                 THEN CASE WHEN e.entry_type = 'DEBIT'  THEN e.amount_minor ELSE -e.amount_minor END
               ELSE CASE WHEN e.entry_type = 'CREDIT' THEN e.amount_minor ELSE -e.amount_minor END
             END
           ), 0)               AS derived_balance_minor
    FROM ledger_accounts a
    LEFT JOIN ledger_entries e ON e.account_id = a.id
    GROUP BY a.id, a.code, a.user_id, a.currency, a.balance_minor, a.account_type
    HAVING a.balance_minor <> COALESCE(SUM(
             CASE
               WHEN a.account_type IN ('ASSET','EXPENSE')
                 THEN CASE WHEN e.entry_type = 'DEBIT'  THEN e.amount_minor ELSE -e.amount_minor END
               ELSE CASE WHEN e.entry_type = 'CREDIT' THEN e.amount_minor ELSE -e.amount_minor END
             END
           ), 0);
  `);

  pgm.sql(`
    CREATE OR REPLACE VIEW v_trial_balance AS
    SELECT currency,
           SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount_minor ELSE 0 END) AS total_debits_minor,
           SUM(CASE WHEN entry_type = 'CREDIT' THEN amount_minor ELSE 0 END) AS total_credits_minor,
           SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount_minor ELSE -amount_minor END) AS net_minor
    FROM ledger_entries
    GROUP BY currency;
  `);
};

export const down = pgm => {
  pgm.sql(`
    DROP VIEW IF EXISTS v_trial_balance;
    DROP VIEW IF EXISTS v_ledger_balance_drift;
    DROP TRIGGER IF EXISTS trg_ledger_entries_apply_balance ON ledger_entries;
    DROP FUNCTION IF EXISTS apply_ledger_entry_to_balance();
    DROP TRIGGER IF EXISTS trg_ledger_transactions_immutable ON ledger_transactions;
    DROP TRIGGER IF EXISTS trg_ledger_entries_immutable ON ledger_entries;
    DROP TRIGGER IF EXISTS trg_ledger_entries_balanced ON ledger_entries;
    DROP FUNCTION IF EXISTS assert_ledger_transaction_balanced();
  `);

  pgm.dropTable('ledger_entries');
  pgm.dropTable('ledger_transactions');
};
