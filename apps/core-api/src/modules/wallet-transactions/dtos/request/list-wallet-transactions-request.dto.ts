import { z } from 'zod';
import { PaginatedRequestSchema } from '@common/libs';

export const ListWalletTransactionsRequestSchema = PaginatedRequestSchema({
  shape: {
    walletId: z.string({ message: 'Wallet ID must be a string' }).min(1, { message: 'Wallet ID is required' })
  }
});

export type ListWalletTransactionsRequestDto = z.infer<typeof ListWalletTransactionsRequestSchema>;
