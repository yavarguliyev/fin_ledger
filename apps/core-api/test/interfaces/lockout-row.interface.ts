export interface LockoutRow {
  attempts: number;
  locked: boolean | null;
}

export interface LockoutLogin {
  password: string;
}

export interface LockoutLoginResponse {
  status: number;
  body: { error?: { message: string } };
}
