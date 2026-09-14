import { z } from 'zod';

export const PayoutFundsSchema = z.object({
  amount: z.number().int().positive({ message: 'Amount must be a positive integer in minor units' }),

  currency: z.string({ message: 'Currency must be a string' }).min(3).max(3),

  recipientToken: z.string({ message: 'Recipient token must be a string' }),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  description: z.string().optional()
});

export type PayoutFundsDto = z.infer<typeof PayoutFundsSchema>;
