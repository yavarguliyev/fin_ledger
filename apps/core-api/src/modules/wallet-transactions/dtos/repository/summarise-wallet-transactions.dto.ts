import { z } from 'zod';

export const SummariseWalletTransactionsSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).optional()
});

export type SummariseWalletTransactionsDto = z.infer<typeof SummariseWalletTransactionsSchema>;
