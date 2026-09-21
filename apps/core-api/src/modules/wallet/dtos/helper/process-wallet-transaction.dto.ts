import { z } from 'zod';
import { AGGREGATE_TYPES, BETTING_TYPES, DomainEventType, EntryType, OutboxRepository, WalletStatus, WalletTransactionType } from '@common/libs';

import { WalletOperationSchema } from '../input/wallet-operation.dto';
import { WalletRepository } from '../../repositories/wallet.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export const ProcessWalletTransactionSchema = WalletOperationSchema.extend({
  walletRepository: z.custom<WalletRepository>(),

  currentAggregateType: z.enum(AGGREGATE_TYPES, { message: 'Aggregate type must be a valid aggregate type' }),

  currentDomainEventType: z.enum(DomainEventType, { message: 'Event type must be a valid domain event type' }),

  currentBettingType: z.enum(BETTING_TYPES, { message: 'Betting type must be a valid betting type' }),

  balanceWalletTransactionType: z.enum(EntryType, { message: 'Entry type must be DEBIT or CREDIT' }),

  currentWalletTransactionType: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }),

  requiredToCheckAmountMinor: z.boolean({ message: 'requiredToCheckAmountMinor must be a boolean' }),

  outboxRepository: z.custom<OutboxRepository>(),

  ledgerService: z.custom<LedgerService>(),

  walletTransactionRepository: z.custom<WalletTransactionRepository>(),

  allowedStatuses: z.array(z.enum(WalletStatus, { message: 'Status must be a valid wallet status' })).optional()
});

export type ProcessWalletTransactionDto = z.infer<typeof ProcessWalletTransactionSchema>;
