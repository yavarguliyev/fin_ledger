import { z } from 'zod';
import { DatabaseAdapter, WalletTransactionStatus, WalletTransactionType } from '@common/libs';

export const CreateWalletTransactionSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  type: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }),

  status: z.enum(WalletTransactionStatus, { message: 'Status must be a valid wallet transaction status' }).optional(),

  conversionId: z.string({ message: 'Conversion ID must be a string' }).optional(),

  ledgerEntryId: z.string({ message: 'Ledger entry ID must be a string' }).optional(),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).optional(),

  reference: z.string({ message: 'Reference must be a string' }).optional()
});

export type CreateWalletTransactionDto = z.infer<typeof CreateWalletTransactionSchema> & { adapter: DatabaseAdapter };
