export const SUPPORT_AVATARS_TEST = {
  CUSTOMER_EMAIL: 'avatars-customer@support-tests.realtime-wallet-payments.com',
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  CONTACTS_PATH: '/support/contacts',
  CONVERSATIONS_PATH: '/support/conversations/',
  CONTACT: '/contact',
  AVATAR_KEY: 'user-avatar-test/photo.png',
  SIGNED_URL: /^https?:\/\/\S+avatar-test/,
  SET_AVATAR_SQL: `UPDATE users SET profile_images = jsonb_build_array($2::text), profile_image_index = 0 WHERE email = $1`,
  CLEAR_AVATAR_SQL: `UPDATE users SET profile_images = '[]'::jsonb, profile_image_index = 0 WHERE email = $1`
} as const;
