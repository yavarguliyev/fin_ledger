import { HTTP_STATUS } from './http-status.constant';

export const READ_FRESHNESS = {
  ...HTTP_STATUS,
  EMAIL: 'player2@realtime-wallet-payments.com',
  WALLET_SQL: 'SELECT w.id, w.currency FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
  BALANCE_SQL: 'SELECT available_balance_minor::int AS balance FROM wallets WHERE id = $1',
  OPEN_EVENT_SQL: "SELECT id FROM game_events WHERE status = 'SCHEDULED' AND betting_closes_at > now() ORDER BY starts_at LIMIT 1",
  METHOD_SQL: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
               SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_simulated_processing_freshness', display_name, '4242', 'visa', 12, 2034, false, now() FROM users WHERE email = $1 RETURNING id`,
  CHARGE_SQL: 'SELECT provider_charge_id FROM payments WHERE id = $1',
  NOTIFICATION_SQL: `INSERT INTO notifications (user_id, type, title, content, status, sent_at)
                     SELECT id, 'INFO', 'Read freshness', 'Stored straight into the table', 'SENT', now() FROM users WHERE email = $1 RETURNING id`,
  WALLET_PATH: (walletId: string): string => `/wallets/${walletId}`,
  PAYMENT_PATH: (paymentId: string): string => `/payments/${paymentId}`,
  BETS_PATH: '/bets',
  DEPOSIT_PATH: '/payments/deposit',
  WEBHOOK_PATH: '/webhooks/stripe',
  NOTIFICATIONS_PATH: '/notifications',
  SELECTION: 'Away',
  STAKE_MINOR: 300,
  BET_KEY: 'freshness-bet',
  DEPOSIT_MINOR: 1800,
  DEPOSIT_KEY: 'freshness-deposit',
  WEBHOOK_EVENT_ID: 'evt_freshness',
  SUCCEEDED: 'payment_intent.succeeded',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED'
} as const;
