import { HTTP_STATUS } from './http-status.constant';

export const ANALYTICS_TOPICS_TEST = {
  EVENT_PREFIX: 'evt_',
  SUCCESS_KEY: 'analytics-topics-success',
  BET_KEY: 'analytics-topics-bet',
  ...HTTP_STATUS,
  EMAIL: 'player17@realtime-wallet-payments.com',
  DEPOSIT_PATH: '/payments/deposit',
  BETS_PATH: '/bets',
  WEBHOOK_PATH: '/webhooks/stripe',
  DEPOSIT_MINOR: 3300,
  STAKE_MINOR: 500,
  SELECTION: 'HOME',
  SUCCEEDED_EVENT: 'payment_intent.succeeded',
  FAILED_EVENT: 'payment_intent.payment_failed',
  PAYMENT_COMPLETED: 'analytics.payment.completed',
  PAYMENT_FAILED: 'analytics.payment.failed',
  WALLET_CREDITED: 'analytics.wallet.credited',
  WALLET_DEBITED: 'analytics.wallet.debited',
  METHOD_SQL: `
    INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
    SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_analytics_topics', display_name, '4242', 'visa', 12, 2034, true, now()
    FROM users WHERE email = $1 RETURNING id
  `,
  WALLET_SQL: `
    SELECT w.id, w.currency FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1
  `,
  EVENT_SQL: "SELECT id FROM game_events WHERE status = 'SCHEDULED' AND betting_closes_at > now() ORDER BY starts_at LIMIT 1",
  FAILING_CHARGE_ID: 'pi_analytics_topics_failing',
  SEED_PROCESSING_SQL: `
    INSERT INTO payments (idempotency_key, user_id, wallet_id, payment_method_id, type, amount_minor, currency, status, provider, provider_charge_id)
    VALUES ('analytics-topics-failure', (SELECT id FROM users WHERE email = $1), $2, $3, 'DEPOSIT', 1500, $4, 'PROCESSING', 'stripe', $5) RETURNING id
  `,
  COUNT_SQL: 'SELECT count(*)::int AS count FROM outbox_events WHERE event_type = $1',
  KAFKA_SQL: "SELECT count(*)::int AS count FROM outbox_events WHERE event_type = $1 AND destination <> 'KAFKA'"
} as const;
