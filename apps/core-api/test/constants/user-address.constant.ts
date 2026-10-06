import { HTTP_STATUS } from './http-status.constant';

export const USER_ADDRESS_TEST = {
  ...HTTP_STATUS,
  OWNER_EMAIL: 'address-owner@user-tests.realtime-wallet-payments.com',
  OTHER_EMAIL: 'address-other@user-tests.realtime-wallet-payments.com',
  ADMIN_EMAIL: 'global_admin@realtime-wallet-payments.com',
  ADDRESS_PATH: '/users/me/address',
  SEARCH_PATH: '/users/me/address/search?q=ab',
  ANONYMIZE_PATH: (userId: string): string => `/users/${userId}/anonymize`,
  PUT: 'PUT',
  POST: 'POST',
  MAP_ADDRESS: {
    line1: '10 Downing Street',
    city: 'London',
    postalCode: 'SW1A 2AA',
    countryCode: 'GB',
    latitude: 51.503396,
    longitude: -0.12764,
    source: 'MAP'
  },
  BAD_COUNTRY: 'Britain',
  NONE: 0,
  COUNT_SQL: 'SELECT count(*)::int AS count FROM user_addresses WHERE user_id = $1'
} as const;
