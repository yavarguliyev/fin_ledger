import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_PREFERENCES_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'prefs-customer@support-tests.realtime-wallet-payments.com',
  OUTSIDER_EMAIL: 'prefs-outsider@support-tests.realtime-wallet-payments.com',
  CONVERSATIONS_PATH: '/support/conversations/',
  PUT: 'PUT',
  MUTE: '/mute',
  PIN: '/pin',
  FAVOURITE: '/favourite',
  THEME: '/theme',
  EIGHT_HOURS: 'EIGHT_HOURS',
  ALWAYS: 'ALWAYS',
  OFF: 'OFF',
  OCEAN: 'OCEAN',
  UNKNOWN_THEME: 'NEON',
  THEME_NOTICE: 'Chat theme changed.',
  EIGHT_HOURS_MS: 28_800_000,
  TOLERANCE_MS: 60_000,
  SEED_PINS: 3,
  SEED_PINNED_SQL: `
    WITH seeded AS (
      INSERT INTO support_conversations (customer_user_id, subject, status)
      SELECT u.id, 'pin seed', 'CLOSED' FROM users u, generate_series(1, $2::int) WHERE u.email = $1
      RETURNING id, customer_user_id
    )
    INSERT INTO support_conversation_preferences (conversation_id, user_id, pinned_at)
    SELECT id, customer_user_id, now() FROM seeded
    RETURNING conversation_id AS "conversationId"
  `
} as const;
