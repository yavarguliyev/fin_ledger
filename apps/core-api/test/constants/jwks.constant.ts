export const JWKS_TEST = {
  PATH: '/.well-known/jwks.json',
  VERSIONED_SUFFIX: /\/api\/v\d+$/,
  EMAIL: 'player1@realtime-wallet-payments.com',
  SEPARATOR: '.',
  ENCODING: 'base64url',
  UTF8: 'utf8',
  FORMAT: 'jwk',
  SIGNATURE_ALGORITHM: 'RSA-SHA256',
  ALGORITHM: 'RS256',
  KEY_TYPE: 'RSA',
  USE: 'sig',
  KEY_COUNT: 1,
  FORGED_PAYLOAD: '{"userId":"someone-else"}'
} as const;
