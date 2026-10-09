import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_PINS_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'pins-customer@support-tests.realtime-wallet-payments.com',
  OUTSIDER_EMAIL: 'pins-outsider@support-tests.realtime-wallet-payments.com',
  CONVERSATIONS_PATH: '/support/conversations/',
  MESSAGES: '/messages/',
  PIN: '/pin',
  PINS: '/pins',
  PUT: 'PUT',
  DELETE: 'DELETE',
  DAY: 'DAY',
  FOREVER: 'FOREVER',
  TEXTS: ['Pin one', 'Pin two', 'Pin three', 'Pin four'],
  LIMIT: 3,
  SYSTEM_KIND: 'SYSTEM',
  NOTICE: 'A message was pinned.'
} as const;
