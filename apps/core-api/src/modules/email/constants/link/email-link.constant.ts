export const EMAIL_LINK = {
  KEY_NAME: 'EMAIL_LINK_ENCRYPTION_KEY',
  KEY_ENCODING: 'base64',
  KEY_ERROR: 'EMAIL_LINK_ENCRYPTION_KEY must be 32 random bytes, base64-encoded',
  SEALED_PREFIX: 'v1:',
  SEALED_ENCODING: 'base64url',
  NO_URL: ''
} as const;
