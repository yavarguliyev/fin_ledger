import { z } from 'zod';

export const FindPaymentByIdempotencyKeySchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' })
});

export type FindPaymentByIdempotencyKeyDto = z.infer<typeof FindPaymentByIdempotencyKeySchema>;
