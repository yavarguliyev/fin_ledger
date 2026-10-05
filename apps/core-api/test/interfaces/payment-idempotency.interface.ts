export interface IdempotencyIdRow {
  id: string;
}

export interface IdempotencyDepositDto {
  email: string;
  idempotencyKey: string;
}

export interface IdempotencyDeposit {
  id: string;
  userId: string;
}
