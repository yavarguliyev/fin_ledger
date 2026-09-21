import { z } from 'zod';

export const PaymentEventPayloadSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).optional(),

  userId: z.string({ message: 'User ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  failureReason: z.string({ message: 'Failure reason must be a string' }).or(z.undefined())
});

export type PaymentEventPayloadDto = z.infer<typeof PaymentEventPayloadSchema>;
