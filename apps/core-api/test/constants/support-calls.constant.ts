import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_CALLS_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'calls-customer@support-tests.realtime-wallet-payments.com',
  STRANGER_EMAIL: 'calls-stranger@support-tests.realtime-wallet-payments.com',
  CALLS_PATH: '/support/calls',
  CONFIG_PATH: '/support/calls/config',
  SDP: 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\ns=-\r\n',
  CANDIDATE: { candidate: 'candidate:1 1 udp 2122260223 127.0.0.1 50000 typ host', sdpMid: '0', sdpMLineIndex: 0 },
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  HANGUP: 'HANGUP',
  MISSED: 'MISSED',
  SYSTEM_KIND: 'SYSTEM',
  VOICE_LOG_PREFIX: 'Voice call · ',
  MISSED_VIDEO_LOG: 'Missed video call'
} as const;
