import { z } from 'zod';

import { WalletSchema } from '../../../wallet';

export const AssertOwnedWalletSchema = z.object({
  wallet: WalletSchema.nullable(),

  userId: z.string({ message: 'User ID must be a string' })
});

export type AssertOwnedWalletDto = z.infer<typeof AssertOwnedWalletSchema>;
