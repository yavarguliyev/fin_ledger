import { z } from 'zod';
import { UnknownRecord } from '@common/libs';

export const RequestPaymentSchema = z.object({
  amountMinor: z
    .number({ message: 'Amount must be an integer (minor units)' })
    .int({ message: 'Amount must be an integer (minor units)' })
    .min(1, { message: 'Amount must be greater than 0' }),

  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' }),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }).min(1, { message: 'Idempotency key is required' }),

  paymentMethodId: z.string({ message: 'Payment method ID must be a string' }).uuid({ message: 'Payment method ID must be a valid UUID' }).optional(),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be a record' }).optional() as z.ZodType<UnknownRecord>
});

export type RequestPaymentDto = z.infer<typeof RequestPaymentSchema>;
