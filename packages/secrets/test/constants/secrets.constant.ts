export const SECRETS_TEST = {
  SECRET_ID: 'ddd-test/core-api',
  ENDPOINT: 'http://localhost:4566',
  REGION: 'eu-west-1',
  KEY: 'test',
  AWS: 'aws',
  ENV: 'env',
  MISSING_FILE: '/nonexistent/.env',
  AWS_FILE_NAME: '.env.aws',
  LOCAL_FILE_NAME: '.env.local',
  OTHER_SECRET_ID: 'ddd-other/core-api',
  TEMP_PREFIX: 'secrets-test-',
  DB_KEY: 'DB_PASSWORD',
  DB_PASSWORD: 'db-password-from-secret',
  JWT_KEY: '-----BEGIN KEY-----\nline\n-----END KEY-----',
  EXPLICIT_PASSWORD: 'explicit-from-environment'
} as const;
