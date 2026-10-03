export interface LoginAttempt {
  email: string;
  password?: string;
}

export interface SessionClaims {
  userId: string;
  jti: string;
}
