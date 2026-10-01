export { shorthands } from './utils/shorthands.js';

const DEMO_EMAIL_PATTERN = '%@realtime-wallet-payments.com';
const DEMO_REFERENCE_TYPE = 'demo_deposit';
const DEMO_PROVIDER = 'demo';

const MIN_SERVER_VERSION = 130000;

const ARGON2_OPTIONS = { memoryCost: 65536, timeCost: 3, parallelism: 4 };

const IMMUTABILITY_TRIGGERS = [
  ['wallet_transactions', 'trg_wallet_transactions_immutable'],
  ['ledger_entries', 'trg_ledger_entries_immutable'],
  ['ledger_transactions', 'trg_ledger_transactions_immutable'],
  ['audit_log', 'trg_audit_log_immutable']
];

const SKIP_UNLESS_DEV = `
  IF current_database() NOT LIKE '%distributed_db%'
    AND current_database() NOT LIKE '%test%'
    AND current_database() NOT LIKE '%local%' THEN
    RAISE NOTICE
      'Skipping demo data: database "%" does not look like a dev/test database',
      current_database();
    RETURN;
  END IF;
`;

const isDevDatabase = database => ['distributed_db', 'test', 'local'].some(marker => database.includes(marker));

export const up = async pgm => {
  const [environment] = await pgm.db.select("SELECT current_database() AS database, current_setting('server_version_num')::int AS server_version");

  if (environment.server_version < MIN_SERVER_VERSION) {
    throw new Error(`PostgreSQL 13 or newer is required to run this migration (found ${environment.server_version})`);
  }

  if (!isDevDatabase(environment.database)) {
    pgm.sql(`
      DO $$
      BEGIN
        RAISE NOTICE
          'Skipping demo data: database "%" does not look like a dev/test database',
          current_database();
      END $$;
    `);

    return;
  }

  if (!process.env.DEMO_USER_PASSWORD) {
    throw new Error('DEMO_USER_PASSWORD must be set to load demo data into a development database. Add it to your .env file.');
  }

  const { default: argon2 } = await import('argon2');
  const pwHash = await argon2.hash(process.env.DEMO_USER_PASSWORD, { type: argon2.argon2id, ...ARGON2_OPTIONS });

  pgm.sql(`
    DO $$
    DECLARE
      v_user_id    uuid;
      v_account_id uuid;
      v_wallet_id  uuid;
      v_txn_id     uuid;
      v_house_cash uuid;
      v_amount     bigint;
      i            integer;

      v_pw_hash text := '${pwHash.replace(/'/g, "''")}';
    BEGIN
      SELECT id
      INTO v_house_cash
      FROM ledger_accounts
      WHERE code = 'HOUSE_CASH_USD';

      IF v_house_cash IS NULL THEN
        RAISE EXCEPTION 'Required ledger account HOUSE_CASH_USD does not exist';
      END IF;

      INSERT INTO users (
        email,
        display_name,
        password_hash,
        password_algo,
        password_changed_at,
        role,
        status,
        is_email_verified,
        email_verified_at
      )
      VALUES
        ('global_admin@realtime-wallet-payments.com', 'Global Admin', v_pw_hash, 'argon2id', CURRENT_TIMESTAMP, 'GLOBAL_ADMIN', 'ACTIVE', true, CURRENT_TIMESTAMP),
        ('admin@realtime-wallet-payments.com',        'Admin',             v_pw_hash, 'argon2id', CURRENT_TIMESTAMP, 'ADMIN',        'ACTIVE', true, CURRENT_TIMESTAMP),
        ('moderator@realtime-wallet-payments.com',    'Moderator',    v_pw_hash, 'argon2id', CURRENT_TIMESTAMP, 'MODERATOR',    'ACTIVE', true, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING;

      FOR i IN 1..25 LOOP
        INSERT INTO users (
          email,
          display_name,
          password_hash,
          password_algo,
          password_changed_at,
          role,
          status,
          is_email_verified,
          email_verified_at,
          terms_accepted_at,
          country_code,
          kyc_status,
          date_of_birth
        )
        VALUES (
          format('player%s@realtime-wallet-payments.com', i),
          format('Player %s', i),
          v_pw_hash,
          'argon2id',
          CURRENT_TIMESTAMP,
          'USER',
          'ACTIVE',
          true,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          'AZ',
          'APPROVED',
          DATE '1990-01-01' + (i * 37)
        )
        RETURNING id INTO v_user_id;

        INSERT INTO ledger_accounts (owner_type, user_id, account_type, currency)
        VALUES ('USER', v_user_id, 'LIABILITY', 'USD')
        RETURNING id INTO v_account_id;

        INSERT INTO wallets (user_id, ledger_account_id, currency)
        VALUES (v_user_id, v_account_id, 'USD')
        RETURNING id INTO v_wallet_id;

        v_amount := 50000 + (i * 1337);

        INSERT INTO ledger_transactions (reference_type, description, idempotency_key)
        VALUES (
          '${DEMO_REFERENCE_TYPE}',
          format('Opening deposit for player %s', i),
          format('demo-deposit-%s', i)
        )
        RETURNING id INTO v_txn_id;

        INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount_minor, currency, description, sequence)
        VALUES
          (v_txn_id, v_house_cash, 'DEBIT',  v_amount, 'USD', 'Cash received',  1),
          (v_txn_id, v_account_id, 'CREDIT', v_amount, 'USD', 'Player balance', 2);

        UPDATE wallets
        SET available_balance_minor = v_amount
        WHERE id = v_wallet_id;

        INSERT INTO wallet_transactions (
          wallet_id,
          type,
          status,
          amount_minor,
          currency,
          balance_after_minor,
          idempotency_key,
          ledger_transaction_id
        )
        VALUES (
          v_wallet_id,
          'DEPOSIT',
          'COMPLETED',
          v_amount,
          'USD',
          v_amount,
          format('demo-wt-%s', i),
          v_txn_id
        );

        INSERT INTO notifications (user_id, type, title, content, status, sent_at, dedupe_key)
        VALUES (
          v_user_id,
          'PAYMENT_COMPLETED',
          'Deposit received',
          'Your opening deposit has been credited.',
          'SENT',
          CURRENT_TIMESTAMP,
          format('demo-notif-%s', i)
        );
      END LOOP;

      FOR i IN 1..15 LOOP
        INSERT INTO game_events (
          provider,
          external_ref,
          sport,
          competition,
          label,
          odds,
          status,
          starts_at,
          betting_closes_at
        )
        VALUES (
          '${DEMO_PROVIDER}',
          format('demo-fixture-%s', i),
          (ARRAY['football', 'basketball', 'tennis', 'mma'])[1 + (i % 4)],
          (ARRAY['Premier League', 'NBA', 'ATP Tour', 'UFC'])[1 + (i % 4)],
          format('Fixture %s', i),
          round((1.25 + random() * 3.5)::numeric, 2),
          CASE WHEN i % 4 = 0 THEN 'LIVE' ELSE 'SCHEDULED' END,
          CURRENT_TIMESTAMP + ((i || ' days')::interval),
          CURRENT_TIMESTAMP + ((i || ' days')::interval)
        );
      END LOOP;

      RAISE NOTICE 'Demo data complete: 28 users, 25 wallets, 15 fixtures.';
    END $$;
  `);

  pgm.sql(`
    DO $$
    DECLARE
      v_drift integer;
      v_net   bigint;
    BEGIN
      SELECT count(*) INTO v_drift FROM v_ledger_balance_drift;

      IF v_drift > 0 THEN
        RAISE EXCEPTION 'Demo data produced % account(s) with balance drift', v_drift;
      END IF;

      SELECT COALESCE(SUM(net_minor), 0) INTO v_net FROM v_trial_balance;

      IF v_net <> 0 THEN
        RAISE EXCEPTION 'Demo data produced an unbalanced trial balance: %', v_net;
      END IF;
    END $$;
  `);
};

export const down = pgm => {
  pgm.sql(`
    DO $$
    BEGIN
      ${SKIP_UNLESS_DEV}
${IMMUTABILITY_TRIGGERS.map(([table, trigger]) => `      EXECUTE 'ALTER TABLE ${table} DISABLE TRIGGER ${trigger}';`).join('\n')}
    END $$;
  `);

  pgm.sql(`
    DO $$
    DECLARE
      v_users integer;
      v_txns  integer;
    BEGIN
      ${SKIP_UNLESS_DEV}

      CREATE TEMP TABLE _demo_users ON COMMIT DROP AS
      SELECT id FROM users WHERE email LIKE '${DEMO_EMAIL_PATTERN}';

      CREATE TEMP TABLE _demo_wallets ON COMMIT DROP AS
      SELECT id FROM wallets WHERE user_id IN (SELECT id FROM _demo_users);

      CREATE TEMP TABLE _demo_txns ON COMMIT DROP AS
      WITH RECURSIVE owned AS (
        SELECT t.id
        FROM ledger_transactions t
        WHERE t.reference_type = '${DEMO_REFERENCE_TYPE}'
           OR t.actor_user_id IN (SELECT id FROM _demo_users)
           OR EXISTS (
             SELECT 1
             FROM ledger_entries e
             JOIN ledger_accounts a ON a.id = e.account_id
             WHERE e.transaction_id = t.id AND a.user_id IN (SELECT id FROM _demo_users)
           )
        UNION
        SELECT t.id FROM ledger_transactions t JOIN owned o ON t.reverses_transaction_id = o.id
      )
      SELECT id FROM owned;

      SELECT count(*) INTO v_users FROM _demo_users;
      SELECT count(*) INTO v_txns FROM _demo_txns;

      DELETE FROM wallet_transactions
      WHERE wallet_id IN (SELECT id FROM _demo_wallets)
         OR ledger_transaction_id IN (SELECT id FROM _demo_txns);

      DELETE FROM bets
      WHERE user_id IN (SELECT id FROM _demo_users)
         OR event_id IN (SELECT id FROM game_events WHERE provider = '${DEMO_PROVIDER}');

      DELETE FROM payments WHERE user_id IN (SELECT id FROM _demo_users);
      DELETE FROM payment_methods WHERE user_id IN (SELECT id FROM _demo_users);
      DELETE FROM notifications WHERE user_id IN (SELECT id FROM _demo_users);
      DELETE FROM audit_log WHERE actor_user_id IN (SELECT id FROM _demo_users);
      DELETE FROM wallets WHERE id IN (SELECT id FROM _demo_wallets);
      DELETE FROM ledger_entries WHERE transaction_id IN (SELECT id FROM _demo_txns);
      DELETE FROM ledger_transactions WHERE id IN (SELECT id FROM _demo_txns);
      DELETE FROM ledger_accounts WHERE user_id IN (SELECT id FROM _demo_users);
      DELETE FROM users WHERE id IN (SELECT id FROM _demo_users);
      DELETE FROM game_events WHERE provider = '${DEMO_PROVIDER}';

      UPDATE ledger_accounts a
      SET balance_minor = COALESCE((
        SELECT SUM(
          CASE
            WHEN a.account_type IN ('ASSET', 'EXPENSE')
              THEN CASE WHEN e.entry_type = 'DEBIT' THEN e.amount_minor ELSE -e.amount_minor END
            ELSE CASE WHEN e.entry_type = 'CREDIT' THEN e.amount_minor ELSE -e.amount_minor END
          END
        )
        FROM ledger_entries e
        WHERE e.account_id = a.id
      ), 0)::bigint;

      RAISE NOTICE 'Demo data rollback complete: % users and % ledger transactions removed.', v_users, v_txns;
    END $$;
  `);

  pgm.sql(`
    DO $$
    BEGIN
      ${SKIP_UNLESS_DEV}
${IMMUTABILITY_TRIGGERS.map(([table, trigger]) => `      EXECUTE 'ALTER TABLE ${table} ENABLE TRIGGER ${trigger}';`).join('\n')}
    END $$;
  `);

  pgm.sql(`
    DO $$
    DECLARE
      v_drift integer;
      v_net   bigint;
      v_left  integer;
    BEGIN
      ${SKIP_UNLESS_DEV}

      SELECT count(*) INTO v_drift FROM v_ledger_balance_drift;
      IF v_drift > 0 THEN
        RAISE EXCEPTION 'Demo data rollback left % account(s) with balance drift', v_drift;
      END IF;

      SELECT COALESCE(SUM(net_minor), 0) INTO v_net FROM v_trial_balance;
      IF v_net <> 0 THEN
        RAISE EXCEPTION 'Demo data rollback left an unbalanced trial balance: %', v_net;
      END IF;

      SELECT count(*) INTO v_left
      FROM users
      WHERE email LIKE '${DEMO_EMAIL_PATTERN}';

      IF v_left > 0 THEN
        RAISE EXCEPTION 'Demo data rollback left % demo user(s) behind', v_left;
      END IF;
    END $$;
  `);
};
