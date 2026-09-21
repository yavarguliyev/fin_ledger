import { z } from 'zod';

export const ChargePaymentSchema = z.object({
  amount: z.number().int().positive({ message: 'Amount must be a positive integer in minor units' }),

  currency: z.string({ message: 'Currency must be a string' }).min(3).max(3),

  customerId: z.string().optional(),

  paymentMethodToken: z.string().optional(),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  description: z.string().optional(),

  metadata: z.record(z.string(), z.string()).optional()
});

export type ChargePaymentDto = z.infer<typeof ChargePaymentSchema>;
