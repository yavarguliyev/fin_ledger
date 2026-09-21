import { z } from 'zod';

export const WalletByCurrencySchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  currency: z.string({ message: 'Currency must be a string' })
});

export type WalletByCurrencyDto = z.infer<typeof WalletByCurrencySchema>;
