import { HTTP_STATUS } from './http-status.constant';

export const PASSKEY_STEP_UP_TEST = {
  ...HTTP_STATUS,
  OPTIONS_PATH: '/auth/passkeys/step-up/options',
  VERIFY_PATH: '/auth/passkeys/step-up/verify',
  WITHDRAW_PATH: '/payments/withdraw',
  MFA_DISABLE_PATH: '/auth/mfa/disable',
  METHOD_CONFIRM_PATH: '/payment-methods/stripe/confirm',
  SESSION_ID: 'cs_test_step_up_probe',
  MFA_CODE: '123456',
  EMAIL: 'player19@realtime-wallet-payments.com',
  DEVICE_LABEL: 'Step-up laptop',
  CREDENTIAL_ID: 'c3RlcC11cC1jcmVkZW50aWFs',
  PUBLIC_KEY: 'c3RlcC11cC1wdWJsaWMta2V5',
  AMOUNT_MINOR: 900000000,
  CURRENCY: 'USD',
  WITHDRAW_KEY: 'step-up-withdraw',
  REQUIRED_MESSAGE: 'Confirm with your passkey before continuing',
  SEED_SQL: `
    INSERT INTO user_credentials (user_id, credential_id, public_key, sign_count, transports, device_label, backed_up)
    SELECT id, $2, $3, 0, ARRAY['internal'], $4, true FROM users WHERE email = $1
  `,
  CLEAN_SQL: 'DELETE FROM user_credentials WHERE credential_id = $1'
} as const;
