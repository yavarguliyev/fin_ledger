import { HTTP_STATUS } from './http-status.constant';

export const STREAM_TICKET = {
  ...HTTP_STATUS,
  USER: 'player3@realtime-wallet-payments.com',
  TICKET_PATH: '/notifications/stream-ticket',
  STREAM_PATH: '/notifications/stream',
  TICKET_PARAM: 'ticket',
  TOKEN_PARAM: 'token'
} as const;
