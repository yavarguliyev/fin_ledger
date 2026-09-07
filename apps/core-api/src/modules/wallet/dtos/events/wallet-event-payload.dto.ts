import { z } from 'zod';

export const WalletEventPayloadSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).optional(),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  type: z.string({ message: 'Type must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' })
});

export type WalletEventPayloadDto = z.infer<typeof WalletEventPayloadSchema>;
