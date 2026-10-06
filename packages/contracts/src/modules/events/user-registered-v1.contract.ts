import { z } from 'zod';

export const UserRegisteredV1Schema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1),

  email: z.string({ message: 'Email must be a string' }).min(1),

  displayName: z.string({ message: 'Display name must be a string' }).nullish(),

  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).min(1)
});

export type UserRegisteredV1 = z.infer<typeof UserRegisteredV1Schema>;
