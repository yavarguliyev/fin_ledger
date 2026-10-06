export const JWKS_SPEC = {
  SUBJECT: 'user-1',
  NEWLINE: '\n',
  ESCAPED_NEWLINE: '\\n',
  FORMAT: 'jwk',
  ALGORITHM: 'RS256',
  KEY_TYPE: 'RSA',
  USE: 'sig',
  KEY_COUNT: 1,
  ROTATED_KEY_COUNT: 2
} as const;
