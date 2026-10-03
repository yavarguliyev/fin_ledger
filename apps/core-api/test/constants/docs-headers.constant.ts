import { HTTP_STATUS } from './http-status.constant';

export const DOCS_HEADERS_TEST = {
  ...HTTP_STATUS,
  API_SUFFIX: /\/api\/v\d+$/,
  DOCS_PATH: '/api-docs',
  CSP_HEADER: 'content-security-policy',
  DEFAULT_POLICY: "default-src 'self'"
} as const;
