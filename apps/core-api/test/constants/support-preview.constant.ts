import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_PREVIEW_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'preview-customer@support-tests.realtime-wallet-payments.com',
  FIRST_TEXT: 'First question about my deposit',
  SECOND_TEXT: 'Second question, sent later',
  EDITED_TEXT: 'Second question, reworded',
  EVERYONE: 'EVERYONE'
} as const;
