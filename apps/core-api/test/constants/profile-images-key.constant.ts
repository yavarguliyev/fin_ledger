import { HTTP_STATUS } from './http-status.constant';

export const PROFILE_IMAGES_KEY_TEST = {
  ...HTTP_STATUS,
  OWNER_EMAIL: 'player22@realtime-wallet-payments.com',
  VICTIM_EMAIL: 'player13@realtime-wallet-payments.com',
  PROFILE_PATH: '/users',
  FORGED_KEY: 'user-00000000-0000-4000-8000-000000000000',
  DISPLAY_NAME: 'Key Probe',
  KEY_PREFIX: 'user-',
  SELECT_SQL: 'SELECT profile_images_key AS key FROM users WHERE email = $1',
  RESET_SQL: 'UPDATE users SET display_name = $2 WHERE email = $1',
  PATCH: 'PATCH',
  EMPTY: '',
  ADD_ACTION: 'add',
  PROBE_IMAGE: 'probe.webp'
} as const;
