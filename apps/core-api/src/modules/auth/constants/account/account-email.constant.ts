export const ACCOUNT_EMAIL = {
  PASSWORD_CHANGED: {
    SUBJECT: 'Your password was changed',
    PURPOSE: 'Password Changed',
    TITLE: 'Your password was changed',
    BODY: 'Your password was changed and every other session was signed out. If this was not you, reset your password immediately.'
  },
  EMAIL_CHANGE: {
    SUBJECT: 'Confirm your new email address',
    PURPOSE: 'Email Change',
    TITLE: 'Confirm your new email address',
    BODY: 'Open the link below to finish moving your account to this address. The link expires in 24 hours.'
  },
  EMAIL_CHANGED: {
    SUBJECT: 'Your email address was changed',
    PURPOSE: 'Email Changed',
    TITLE: 'Your email address was changed',
    BODY: 'The email address on your account was changed. If this was not you, contact support immediately.'
  },
  AGGREGATE_TYPE: 'User',
  CONFIRM_PATH: '/auth/confirm-email-change',
  PROFILE_PATH: '/profile'
} as const;

export const ACCOUNT_ERRORS = {
  WRONG_PASSWORD: 'The current password is incorrect',
  SAME_PASSWORD: 'The new password must differ from the current one',
  EMAIL_TAKEN: 'That email address is already in use',
  SAME_EMAIL: 'That is already your email address',
  NO_PENDING_EMAIL: 'There is no pending email change for this account',
  USER_NOT_FOUND: 'User not found'
} as const;
