import { HTTP_STATUS } from './http-status.constant';

export const PAYMENT_OPEN_RESULTS = {
  ...HTTP_STATUS,
  EMAIL: 'player24@realtime-wallet-payments.com',
  THREE_DS_CARD: 'pm_card_threeDSecure2Required',
  PROCESSING_CARD: 'pm_simulated_processing',
  DECLINED_CARD: 'pm_card_chargeDeclinedInsufficientFunds',
  CARDS: ['pm_card_threeDSecure2Required', 'pm_simulated_processing', 'pm_card_chargeDeclinedInsufficientFunds'],
  DEPOSIT_PATH: '/payments/deposit',
  WEBHOOK_PATH: '/webhooks/stripe',
  DEPOSIT_MINOR: 3000,
  THREE_DS_KEY: 'open-3ds',
  PROCESSING_KEY: 'open-processing',
  DECLINED_KEY: 'open-declined',
  EVENT_PREFIX: 'evt_open_3ds_',
  SUCCEEDED: 'payment_intent.succeeded',
  SECRET_FRAGMENT: '_secret_',
  REQUIRES_ACTION: 'REQUIRES_ACTION',
  OPEN_3DS: { status: 'REQUIRES_ACTION', failure_code: null, has_charge_id: true, credited: false },
  OPEN_PROCESSING: { status: 'PROCESSING', failure_code: null, has_charge_id: true, credited: false },
  COMPLETED_CREDITED: { status: 'COMPLETED', credited: true },
  DECLINED: { status: 'FAILED', failure_code: 'insufficient_funds' },
  BALANCE_SQL: 'SELECT available_balance_minor::int AS balance FROM wallets WHERE id = $1',
  STORED_SQL:
    'SELECT status, failure_code, provider_charge_id IS NOT NULL AS has_charge_id, ledger_transaction_id IS NOT NULL AS credited FROM payments WHERE id = $1',
  WALLET_SQL: 'SELECT id, currency FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = $1)',
  METHOD_SQL: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
               SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', $2, display_name, '4242', 'visa', 12, 2034, false, now() FROM users WHERE email = $1 RETURNING id`,
  CHARGE_SQL: 'SELECT provider_charge_id FROM payments WHERE id = $1',
  DECLINED_SQL: 'SELECT status, failure_code FROM payments WHERE idempotency_key = $1'
} as const;
