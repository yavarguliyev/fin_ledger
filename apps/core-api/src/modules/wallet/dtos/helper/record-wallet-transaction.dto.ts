import { z } from 'zod';
import { EntryType, WalletTransactionType } from '@common/libs';

import { WalletTransactionInputSchema } from './wallet-transaction-input.dto';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export const RecordWalletTransactionSchema = z.object({
  input: WalletTransactionInputSchema,

  ledgerService: z.custom<LedgerService>(),

  walletTransactionRepository: z.custom<WalletTransactionRepository>(),

  transactionType: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }),

  direction: z.enum(EntryType, { message: 'Entry type must be DEBIT or CREDIT' })
});

export type RecordWalletTransactionDto = z.infer<typeof RecordWalletTransactionSchema>;
