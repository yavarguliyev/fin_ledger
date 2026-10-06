import { HTTP_STATUS } from './http-status.constant';

export const LINK_PREVIEW_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'link-preview@support-tests.realtime-wallet-payments.com',
  PATH: '/support/link-preview',
  QUERY_SEPARATOR: '?',
  REFUSED_URLS: [
    'http://127.0.0.1:3000/api/v1/health',
    'http://localhost/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://10.0.0.5/',
    'ftp://example.com/file'
  ],
  MALFORMED: 'not a link',
  SAFE_URL: 'https://example.com/'
} as const;
