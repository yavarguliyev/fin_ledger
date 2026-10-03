import { HTTP_STATUS } from './http-status.constant';

export const PAYMENT_COMPLETION = {
  ...HTTP_STATUS,
  EMAIL: 'player23@realtime-wallet-payments.com',
  WEBHOOK_PATH: '/webhooks/stripe',
  DEPOSIT_PATH: '/payments/deposit',
  EVENT_PREFIX: 'evt_',
  SUCCEEDED: 'payment_intent.succeeded',
  FAILED: 'payment_intent.payment_failed',
  CHARGE_SUCCEEDED: 'charge.succeeded',
  SYNC_MINOR: 2500,
  SYNC_KEY: 'completion-sync',
  PROCESSING_MINOR: 4000,
  PROCESSING_CHARGE: 'pi_integration_processing',
  METADATA_MINOR: 1200,
  NEVER_STORED_CHARGE: 'pi_never_stored',
  NEVER_STORED_CH: 'ch_never_stored',
  BAD_PAYMENT_ID: 'not-a-uuid',
  PENDING: 'PENDING',
  ONE_COMPLETION: { status: 'COMPLETED', wallet_transactions: 1, ledger_entries: 2, completed_events: 1, failed_events: 0 },
  NO_DRIFT: [{ count: 0 }],
  BALANCE_SQL: 'SELECT available_balance_minor::int AS balance FROM wallets WHERE id = $1',
  RECORDS_SQL: `SELECT p.status,
                       (SELECT count(*)::int FROM wallet_transactions w WHERE w.ledger_transaction_id = p.ledger_transaction_id) AS wallet_transactions,
                       (SELECT count(*)::int FROM ledger_entries e WHERE e.transaction_id = p.ledger_transaction_id) AS ledger_entries,
                       (SELECT count(*)::int FROM outbox_events o WHERE o.aggregate_id = p.id AND o.event_type = 'payment.completed') AS completed_events,
                       (SELECT count(*)::int FROM outbox_events o WHERE o.aggregate_id = p.id AND o.event_type = 'payment.failed') AS failed_events
                FROM payments p WHERE p.id = $1`,
  WALLET_SQL: 'SELECT id, currency, available_balance_minor::int AS balance FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = $1)',
  METHOD_SQL: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
               SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_integration_completion', display_name, '4242', 'visa', 12, 2034, true, now() FROM users WHERE email = $1 RETURNING id`,
  PROCESSING_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, payment_method_id, type, amount_minor, currency, status, provider, provider_charge_id)
                   VALUES ('completion-webhook', (SELECT id FROM users WHERE email = $1), $2, $3, 'DEPOSIT', 4000, $4, 'PROCESSING', 'stripe', 'pi_integration_processing') RETURNING id`,
  COMPLETED_SQL: "SELECT id, provider_charge_id FROM payments WHERE idempotency_key = 'completion-webhook'",
  METADATA_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, payment_method_id, type, amount_minor, currency, status, provider)
                 VALUES ('completion-metadata', (SELECT id FROM users WHERE email = $1), $2, $3, 'DEPOSIT', 1200, $4, 'PENDING', 'stripe') RETURNING id`,
  CHARGE_SQL: 'SELECT provider_charge_id FROM payments WHERE id = $1',
  WALLET_DRIFT_SQL: 'SELECT count(*)::int AS count FROM v_wallet_ledger_drift',
  LEDGER_DRIFT_SQL: 'SELECT count(*)::int AS count FROM v_ledger_balance_drift'
} as const;
