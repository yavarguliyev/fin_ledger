export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 100,
  LENGTH_MESSAGE: 'Password must be at least 6 characters long',
  MAX_LENGTH_MESSAGE: 'Password must not exceed 100 characters'
} as const;
