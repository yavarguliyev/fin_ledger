export const LOCKOUT_RESET = {
  SQL: 'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = ANY($1::citext[])'
} as const;
