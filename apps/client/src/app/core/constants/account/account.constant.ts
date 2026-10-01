export const ACCOUNT = {
  CHANGE_PASSWORD_PATH: '/auth/change-password',
  CHANGE_EMAIL_PATH: '/auth/change-email',
  CONFIRM_EMAIL_CHANGE_PATH: '/auth/confirm-email-change',
  MIN_PASSWORD_LENGTH: 6,
  PASSWORD_CHANGED_MESSAGE: 'Password changed. Other devices were signed out.',
  EMAIL_CHANGE_FALLBACK: 'Could not change the email address',
  PASSWORD_CHANGE_FALLBACK: 'Could not change the password',
  CONFIRM_FALLBACK: 'This link is invalid, has expired or has already been used'
} as const;
