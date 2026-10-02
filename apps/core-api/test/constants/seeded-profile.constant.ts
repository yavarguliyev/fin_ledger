export const SEEDED_PROFILE_TEST = {
  EMAIL: 'player16@realtime-wallet-payments.com',
  PATH: '/users',
  STATUS_SQL: 'SELECT kyc_status, country_code, to_char(date_of_birth, \'YYYY-MM-DD\') AS date_of_birth FROM users WHERE email = $1',
  NOT_STARTED: 'NOT_STARTED',
  DISPLAY_NAME: 'Player 16',
  COUNTRY_CODE: 'DE',
  DATE_OF_BIRTH: '1991-05-05',
  OK_STATUS: 200
} as const;
