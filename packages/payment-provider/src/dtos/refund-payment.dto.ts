import { z } from 'zod';

export const RefundPaymentSchema = z.object({
  chargeId: z.string({ message: 'Charge ID must be a string' }),

  amount: z.number().int().positive({ message: 'Amount must be a positive integer in minor units' }),

  currency: z.string({ message: 'Currency must be a string' }).min(3).max(3),

  reason: z.string().optional(),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' })
});

export type RefundPaymentDto = z.infer<typeof RefundPaymentSchema>;
