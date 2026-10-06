export const MAILER_TEST = {
  TOKEN: 'eyJhbGciOiJIUzI1NiJ9.super-secret-reset-token',
  FROM: 'no-reply@wallet.test',
  FROM_KEY: 'EMAIL_FROM',
  TO: 'player@wallet.test',
  SUBJECT: 'Reset your password',
  PURPOSE: 'password-reset',
  BODY: 'Use the link below.',
  RESET_URL: 'https://wallet.test/reset?token=',
  SMTP_HOST: 'smtp.wallet.test',
  SMTP_ERROR: 'smtp refused',
  SES_ENDPOINT: 'http://localhost:4566',
  SES_REGION: 'eu-west-1',
  SES_KEY: 'test',
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
} as const;
