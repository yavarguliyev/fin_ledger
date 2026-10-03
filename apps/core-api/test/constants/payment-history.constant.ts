import { HTTP_STATUS } from './http-status.constant';

export const PAYMENT_HISTORY = {
  ...HTTP_STATUS,
  EMAIL: 'player24@realtime-wallet-payments.com',
  CHARGE_ID: 'pi_history_probe',
  IMMUTABLE: /immutable/i,
  WEBHOOK_PATH: '/webhooks/stripe',
  EVENT_PREFIX: 'evt_history_',
  SUCCEEDED: 'payment_intent.succeeded',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  METHOD_SQL: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
               SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_history_probe', display_name, '4242', 'visa', 12, 2034, true, now() FROM users WHERE email = $1 RETURNING id`,
  PAYMENT_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, payment_method_id, type, amount_minor, currency, status, provider, provider_charge_id)
                SELECT 'history-probe', u.id, w.id, $2, 'DEPOSIT', 3000, w.currency, 'PROCESSING', 'stripe', $3
                FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
  HISTORY_SQL: 'SELECT from_status, to_status, source FROM payment_status_history WHERE payment_id = $1 ORDER BY created_at',
  REWRITE_HISTORY_SQL: "UPDATE payment_status_history SET to_status = 'FAILED' WHERE payment_id = $1",
  ERASE_HISTORY_SQL: 'DELETE FROM payment_status_history WHERE payment_id = $1',
  CHANGE_AMOUNT_SQL: 'UPDATE wallet_transactions SET amount_minor = amount_minor + 1 WHERE id = (SELECT id FROM wallet_transactions LIMIT 1)',
  ANY_TRANSACTION_SQL: 'SELECT id, status FROM wallet_transactions LIMIT 1',
  SET_STATUS_SQL: 'UPDATE wallet_transactions SET status = $1 WHERE id = $2',
  RETIRED_OUTBOX_SQL: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, status)
                       VALUES ('Payment', $1, 'payment.completed', $2, '{}'::jsonb, 'FAILED')`
} as const;
