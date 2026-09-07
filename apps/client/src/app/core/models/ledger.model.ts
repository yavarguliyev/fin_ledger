import {
  AccountId,
  AmountMinor,
  BalanceMinor,
  CreatedAt,
  Currency,
  Id,
  LedgerAccountType,
  LedgerWalletTransactionType,
  Reference,
  TransactionId,
  UpdatedAt,
  UserId
} from './base.mode';

export interface LedgerAccount extends Id, UserId, Currency, CreatedAt, UpdatedAt, BalanceMinor {
  accountType: LedgerAccountType;
}

export interface LedgerEntry extends Id, Currency, CreatedAt, AmountMinor, Reference, AccountId, TransactionId {
  description: string;
  sequence: number;
  entryType: LedgerWalletTransactionType;
}
