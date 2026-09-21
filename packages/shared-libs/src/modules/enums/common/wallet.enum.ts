export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED'
}

export enum WalletTransactionStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  REVERSED = 'REVERSED'
}

export enum WalletTransactionType {
  ADJUSTMENT = 'ADJUSTMENT',
  BET_PAYOUT = 'BET_PAYOUT',
  BET_REFUND = 'BET_REFUND',
  BET_STAKE = 'BET_STAKE',
  DEPOSIT = 'DEPOSIT',
  FEE = 'FEE',
  WITHDRAWAL = 'WITHDRAWAL'
}
