import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_PRIVACY_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'privacy-customer@support-tests.realtime-wallet-payments.com',
  CONVERSATIONS_PATH: '/support/conversations/',
  PRIVACY: '/privacy',
  MESSAGES: '/messages/',
  DOWNLOAD: '/download',
  ATTACHMENTS: '/attachments',
  FIELD_NAME: 'files',
  POST: 'POST',
  PUT: 'PUT',
  PNG_BYTES: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  PNG_TYPE: 'image/png',
  PNG_NAME: 'receipt.png',
  TEXT: 'Here is my receipt',
  ON_NOTICE: 'Advanced chat privacy is on. Media and files can be viewed in the chat but not downloaded by the other person.',
  ATTACHMENT_DISPOSITION: 'response-content-disposition=attachment',
  AUDIT_ACTION: 'SUPPORT_PRIVACY_CHANGED'
} as const;
