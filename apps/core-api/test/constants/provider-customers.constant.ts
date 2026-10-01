export const PROVIDER_CUSTOMERS_TEST = {
  FIRST_EMAIL: 'player22@realtime-wallet-payments.com',
  SECOND_EMAIL: 'player23@realtime-wallet-payments.com',
  PROVIDER: 'stripe',
  CUSTOMER_ID: 'cus_integration_one',
  OTHER_CUSTOMER_ID: 'cus_integration_two',
  INSERT_SQL: `
    INSERT INTO provider_customers (user_id, provider, provider_customer_id)
    SELECT id, $2, $3 FROM users WHERE email = $1
  `,
  COUNT_SQL: `
    SELECT count(*)::int AS count
    FROM provider_customers c JOIN users u ON u.id = c.user_id
    WHERE u.email = $1
  `,
  UNIQUE_USER_CONSTRAINT: 'uq_provider_customers_user',
  UNIQUE_EXTERNAL_CONSTRAINT: 'uq_provider_customers_external',
  BAD_PROVIDER: 'not-a-provider',
  PROVIDER_CONSTRAINT: 'chk_provider_customers_provider'
} as const;
