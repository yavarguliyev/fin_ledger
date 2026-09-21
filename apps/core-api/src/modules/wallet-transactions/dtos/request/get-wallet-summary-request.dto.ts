import { z } from 'zod';

export const GetWalletSummaryRequestSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1, { message: 'Wallet ID is required' })
});

export type GetWalletSummaryRequestDto = z.infer<typeof GetWalletSummaryRequestSchema>;
