import { z } from 'zod';
import { PaymentOperation } from '@common/libs';

export const PaymentIdempotencyKeySchema = z.object({
  operation: z.enum(PaymentOperation, { message: 'Operation must be a valid payment operation' }),

  paymentId: z.string({ message: 'Payment ID must be a string' })
});

export type PaymentIdempotencyKeyDto = z.infer<typeof PaymentIdempotencyKeySchema>;
