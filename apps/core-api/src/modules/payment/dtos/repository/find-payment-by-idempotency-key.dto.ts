import { z } from 'zod';

export const FindPaymentByIdempotencyKeySchema = z.object({
  idempotencyKey: z.string({ message: 'Idempotency key must be a string' })
});

export type FindPaymentByIdempotencyKeyDto = z.infer<typeof FindPaymentByIdempotencyKeySchema>;
