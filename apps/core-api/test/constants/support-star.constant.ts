import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_STAR_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'star-customer@support-tests.realtime-wallet-payments.com',
  OUTSIDER_EMAIL: 'star-outsider@support-tests.realtime-wallet-payments.com',
  CONVERSATIONS_PATH: '/support/conversations/',
  MESSAGES: '/messages/',
  STAR: '/star',
  STARRED: '/starred',
  ALL_STARRED_PATH: '/support/starred',
  PUT: 'PUT',
  DELETE: 'DELETE',
  KEEP_TEXT: 'Your reference number is 4471',
  GONE_TEXT: 'Typo, ignore this',
  EVERYONE: 'EVERYONE'
} as const;
