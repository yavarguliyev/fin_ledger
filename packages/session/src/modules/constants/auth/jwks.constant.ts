export const JWKS = {
  ALGORITHM: 'RS256',
  USE: 'sig',
  KEY_TYPE: 'RSA',
  DIGEST: 'sha256',
  ENCODING: 'base64url',
  FORMAT: 'jwk',
  ESCAPED_NEWLINE: /\\n/g,
  NEWLINE: '\n'
} as const;
