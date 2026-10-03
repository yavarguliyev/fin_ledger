import { HTTP_STATUS } from './http-status.constant';

export const WEBHOOK_INBOX = {
  ...HTTP_STATUS,
  EMAIL: 'player25@realtime-wallet-payments.com',
  PROVIDER: 'stripe',
  FAILING_AMOUNT: 777,
  DUPLICATE_AMOUNT: 900,
  WEBHOOK_PATH: '/webhooks/stripe',
  CHARGE_PREFIX: 'pi_',
  SUCCEEDED: 'payment_intent.succeeded',
  UNHANDLED_TYPE: 'customer.created',
  CRASH_KEY: 'inbox-crash',
  REPLAY_KEY: 'inbox-replay',
  DUPLICATE_KEY: 'inbox-duplicate',
  CRASH_EVENT: 'evt_inbox_crash',
  REPLAY_EVENT: 'evt_inbox_replay',
  DUPLICATE_EVENT: 'evt_inbox_duplicate',
  UNHANDLED_EVENT: 'evt_inbox_unhandled',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REPLAY_DEADLINE_MS: 20_000,
  REPLAY_POLL_MS: 500,
  REPLAY_TIMEOUT_MS: 30_000,
  RECEIVED_ONCE: { status: 'RECEIVED', attempts: 1, processed: false },
  PROCESSED_TWICE: { status: 'PROCESSED', attempts: 2, processed: true },
  IGNORED_ONCE: { status: 'IGNORED', attempts: 1, processed: false },
  ONE_TRANSACTION: [{ count: 1 }],
  EVENT_ROW_SQL: 'SELECT status, attempts, processed_at IS NOT NULL AS processed FROM webhook_events WHERE provider = $1 AND event_id = $2',
  STATUS_SQL: 'SELECT status FROM payments WHERE id = $1',
  PENDING_DEPOSIT_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, type, amount_minor, currency, status, provider)
                        SELECT $2, u.id, w.id, 'DEPOSIT', $3, w.currency, 'PENDING', 'stripe'
                        FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
  TRANSACTION_COUNT_SQL: 'SELECT count(*)::int AS count FROM wallet_transactions w JOIN payments p ON p.ledger_transaction_id = w.ledger_transaction_id WHERE p.id = $1',
  CREATE_FUNCTION_SQL: `CREATE OR REPLACE FUNCTION test_fail_wallet_transaction() RETURNS trigger AS $$
                        BEGIN IF NEW.amount_minor = 777 THEN RAISE EXCEPTION 'simulated crash while handling a webhook'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql`,
  CREATE_TRIGGER_SQL: 'CREATE TRIGGER test_fail_wallet_transaction BEFORE INSERT ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION test_fail_wallet_transaction()',
  DROP_TRIGGER_SQL: 'DROP TRIGGER IF EXISTS test_fail_wallet_transaction ON wallet_transactions',
  DROP_FUNCTION_SQL: 'DROP FUNCTION IF EXISTS test_fail_wallet_transaction()'
} as const;
