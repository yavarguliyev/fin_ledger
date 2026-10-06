import { HTTP_STATUS } from './http-status.constant';

export const HTTP_HARDENING_TEST = {
  ...HTTP_STATUS,
  PAYLOAD_TOO_LARGE: 413,
  LOGIN_PATH: '/auth/login',
  OPTIONS: 'OPTIONS',
  POST: 'POST',
  PREFLIGHT_HEADERS: { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
  ORIGIN_HEADER: 'Origin',
  JSON_HEADERS: { 'Content-Type': 'application/json' },
  ALLOW_ORIGIN: 'access-control-allow-origin',
  ALLOW_CREDENTIALS: 'access-control-allow-credentials',
  TRUE: 'true',
  SECURITY_HEADERS: {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'referrer-policy': 'no-referrer'
  },
  CSP: 'content-security-policy',
  CSP_DIRECTIVES: ["default-src 'none'", "frame-ancestors 'none'"],
  POWERED_BY: 'x-powered-by',
  OVERSIZED_EMAIL: 'a@b.c',
  FILLER: 'x',
  OVERSIZED_BYTES: 200 * 1024,
  TOO_LARGE_ERROR: { error: { code: 'HTTP_413', retryable: false } },
  MALFORMED_JSON: '{"email":'
} as const;
