import {
  AmountMinor,
  AvailableBalanceMinor,
  CreatedAt,
  Currency,
  GameStatus,
  Id,
  PaymentStatus,
  Reference,
  ReservedBalanceMinor,
  TransactionId,
  TransactionStatus,
  TransactionType,
  UpdatedAt,
  UserId,
  WalletId,
  WalletStatus
} from './base.mode';

export interface BetRequest extends AmountMinor, Currency, Reference, TransactionId {}

export interface WalletSummary extends Currency, AvailableBalanceMinor, ReservedBalanceMinor {
  totalBalance: number;
}

export interface Payment extends Id, CreatedAt, AmountMinor, Currency {
  status: PaymentStatus;
  provider?: string;
}

export interface Transaction extends Id, CreatedAt, UpdatedAt, AmountMinor, Currency, Reference, TransactionId, WalletId {
  status: TransactionStatus;
  type: TransactionType;
}

export interface Wallet extends Id, UserId, CreatedAt, UpdatedAt, Currency, AvailableBalanceMinor, ReservedBalanceMinor {
  version: number;
  status: WalletStatus;
}

export interface GameEvent extends Id, CreatedAt, UpdatedAt {
  label: string;
  odds: number;
  status: GameStatus;
}

export interface PaymentRequest extends AmountMinor, Currency {
  idempotencyKey: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface WalletTransactionSummary {
  totalDepositsMinor: number;
  totalWithdrawalsMinor: number;
  totalWinningsMinor: number;
  betsCount: number;
}
