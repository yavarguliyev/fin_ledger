import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_HISTORY_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'history-customer@support-tests.realtime-wallet-payments.com',
  CONVERSATIONS_PATH: '/support/conversations/',
  MESSAGES: '/messages/',
  STAR: '/star',
  CLEAR: '/clear',
  DELETE_MANY: '/messages/delete',
  POST: 'POST',
  PUT: 'PUT',
  ME: 'ME',
  EVERYONE: 'EVERYONE',
  KEEP: 'Keep this reference: 5521',
  FIRST: 'First question',
  SECOND: 'Second question',
  STAFF_REPLY: 'Staff reply',
  MINE_ONE: 'Delete me one',
  MINE_TWO: 'Delete me two',
  MINE_THREE: 'Hide me only for myself',
  STAFF_TWO: 'Staff message to hide'
} as const;
