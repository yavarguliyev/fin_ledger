export const PROFILE_FIELDS = {
  COUNTRY_CODE_PATTERN: /^[A-Z]{2}$/,
  COUNTRY_CODE_LENGTH: 2,
  MIN_AGE_YEARS: 18,
  MAX_AGE_YEARS: 120,
  KYC_APPROVED: 'APPROVED',
  LOCKED_MESSAGE: 'Country and date of birth cannot be changed once identity verification is approved. Contact support.'
} as const;
