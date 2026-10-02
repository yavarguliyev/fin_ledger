export const PAYMENT_RECEIPT_TEST = {
  OWNER_EMAIL: 'player15@realtime-wallet-payments.com',
  OTHER_EMAIL: 'receipt-other@support-tests.realtime-wallet-payments.com',
  WALLET_SQL: 'SELECT id, currency FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = $1) LIMIT 1',
  METHOD_SQL: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
               SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_integration_receipt', display_name, '4242', 'visa', 12, 2034, false, now() FROM users WHERE email = $1 RETURNING id`,
  PAYMENT_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, payment_method_id, type, amount_minor, currency, status, provider, provider_charge_id)
                VALUES ($1, (SELECT id FROM users WHERE email = $2), $3, $4, 'DEPOSIT', 4000, $5, $6, 'stripe', $7) RETURNING id`,
  STATUS_SQL: 'SELECT status FROM payments WHERE id = $1',
  WEBHOOK_PATH: '/webhooks/stripe',
  SUCCEEDED: 'payment_intent.succeeded',
  PROCESSING: 'PROCESSING',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  RECEIPT_PATH: (paymentId: string): string => `/payments/${paymentId}/receipt`,
  CONTENT_TYPE: 'application/pdf',
  DISPOSITION_FRAGMENT: 'attachment; filename="receipt-R-',
  LAST_FOUR: '4242',
  AMOUNT_TEXT: '40.00',
  BRAND: 'Visa',
  OK: 200,
  NOT_FOUND: 404,
  POLL_MS: 250,
  POLL_LIMIT: 40,
  CHARGE_PREFIX: 'pi_receipt_',
  EVENT_PREFIX: 'evt_'
} as const;
