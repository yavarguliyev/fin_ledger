export const SECURITY_HEADERS = {
  HSTS_MAX_AGE_SECONDS: 31_536_000,
  NONE: ["'none'"],
  REFERRER_POLICY: 'no-referrer',
  FRAME_GUARD: 'deny',
  RESOURCE_POLICY: 'same-site',
  PATH_SEPARATOR: '/'
} as const;
