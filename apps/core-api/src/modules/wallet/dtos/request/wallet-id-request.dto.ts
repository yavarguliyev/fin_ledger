import { z } from 'zod';

export const WalletIdRequestSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1, { message: 'Wallet ID is required' })
});

export type WalletIdRequestDto = z.infer<typeof WalletIdRequestSchema>;
