export const SECRETS_CONSTANTS = {
  LOGGER_CONTEXT: 'SecretsLoader',
  LABEL: 'secrets',
  KEYS: {
    SOURCE: 'SECRETS_SOURCE',
    REGION: 'SECRETS_REGION',
    ENDPOINT: 'SECRETS_ENDPOINT',
    ACCESS_KEY_ID: 'SECRETS_ACCESS_KEY_ID',
    SECRET_ACCESS_KEY: 'SECRETS_SECRET_ACCESS_KEY'
  },
  ID_KEY: 'SECRETS_ID',
  ERRORS: {
    MISSING_ID: 'SECRETS_SOURCE is aws but SECRETS_ID is not set',
    EMPTY_SECRET: 'Secret has no string value'
  }
} as const;
