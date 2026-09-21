import { z } from 'zod';

export const UserRegisteredPayloadSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).optional(),

  userId: z.string({ message: 'User ID must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' })
});

export type UserRegisteredPayloadDto = z.infer<typeof UserRegisteredPayloadSchema>;
