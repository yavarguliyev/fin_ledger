import { z } from 'zod';
import { AggregateType, BettingType, DatabaseAdapter, DomainEventType, OutboxRepository, WalletTransactionType } from '@common/libs';

import { CreditDebitSchema } from '../balance-operation/credit-debit.dto';
import { WalletRepository } from '../../repositories/wallet.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export type PlaceBetInput = z.infer<typeof CreditDebitSchema> & { walletId: string; adapter?: DatabaseAdapter | undefined };
export type PlaceBetDto = z.infer<typeof CreditDebitSchema>;

export type PlaceBet = PlaceBetInput & {
  walletRepository: WalletRepository;
  currentAggregateType: AggregateType;
  currentDomainEventType: DomainEventType;
  currentBettingType: BettingType;
  balanceWalletTransactionType: WalletTransactionType;
  currentWalletTransactionType: WalletTransactionType;
  requiredToCheckAmountMinor: boolean;
  outboxRepository: OutboxRepository;
  ledgerService: LedgerService;
  walletTransactionRepository: WalletTransactionRepository;
};

export type ValidateWalletTransactionInput = {
  wallet: Awaited<ReturnType<WalletRepository['findByIdForUpdate']>>;
  currency: string;
  amountMinor: number;
  requiredToCheckAmountMinor: boolean;
};

export type BuildWalletTransactionInput = {
  wallet: NonNullable<Awaited<ReturnType<WalletRepository['findByIdForUpdate']>>>;
  amountMinor: number;
  transactionId: string;
  adapter: DatabaseAdapter | undefined;
  reference: string | undefined;
};

export type BuildAnalyticsEventPayloadInput = {
  walletId: string;
  amountMinor: number;
  currency: string;
  transactionId: string;
  reference: string | undefined;
  currentBettingType: BettingType;
};

export type WalletTransactionOutput = {
  wallet: NonNullable<Awaited<ReturnType<WalletRepository['findByIdForUpdate']>>>;
  amountMinor: number;
  transactionId: string;
  adapter?: DatabaseAdapter;
  reference?: string;
};
