import { z } from 'zod';
import { WalletTransactionType } from '@common/libs';

export const FindWalletTransactionsSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).optional(),

  type: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }).optional(),

  limit: z.number({ message: 'Limit must be a number' }).int().positive(),

  offset: z.number({ message: 'Offset must be a number' }).int().nonnegative()
});

export type FindWalletTransactionsDto = z.infer<typeof FindWalletTransactionsSchema>;
