import { HTTP_STATUS } from './http-status.constant';

export const CALL_RENEGOTIATE_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'renegotiate-customer@support-tests.realtime-wallet-payments.com',
  STRANGER_EMAIL: 'renegotiate-stranger@support-tests.realtime-wallet-payments.com',
  RENEGOTIATE_SUFFIX: '/renegotiate',
  ANSWER_SUFFIX: '/answer',
  END_SUFFIX: '/end',
  EVENT: 'support.call.renegotiate',
  OFFER: 'offer',
  NOT_A_TYPE: 'pranswer',
  RESTART_SDP: 'v=0\r\no=- 2 3 IN IP4 127.0.0.1\r\ns=-\r\n'
} as const;
