import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_LOCK_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'lock-customer@support-tests.realtime-wallet-payments.com',
  LOCK_PATH: '/auth/passkeys/chat-lock',
  UNLOCK_PATH: '/auth/passkeys/chat-unlock',
  CONVERSATIONS_PATH: '/support/conversations/',
  LOCK: '/lock',
  MESSAGES: '/messages',
  POST: 'POST',
  DELETE: 'DELETE',
  TEXT: 'Please keep this private',
  GRANT_PREFIX: 'passkey-step-up:',
  GRANT_VALUE: 'granted',
  GRANT_TTL_SECONDS: 300,
  EXPIRE_FLAG: 'EX',
  CREDENTIAL_ID: 'bG9jay1jaGF0LWNyZWRlbnRpYWw',
  PUBLIC_KEY: 'bG9jay1jaGF0LXB1YmxpYy1rZXk',
  DEVICE_LABEL: 'Lock test phone',
  SEED_SQL: `
    INSERT INTO user_credentials (user_id, credential_id, public_key, sign_count, transports, device_label, backed_up)
    SELECT id, $2, $3, 0, ARRAY['internal'], $4, true FROM users WHERE email = $1
  `,
  CLEAN_SQL: 'DELETE FROM user_credentials WHERE credential_id = $1'
} as const;
