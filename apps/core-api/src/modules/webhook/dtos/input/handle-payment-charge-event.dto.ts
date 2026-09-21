import { z } from 'zod';
import { PaymentStatus } from '@common/libs';

export const HandlePaymentChargeEventSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }).min(1, { message: 'Provider is required' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  status: z.enum(PaymentStatus, { message: 'Status must be a valid payment status' })
});

export type HandlePaymentChargeEventDto = z.infer<typeof HandlePaymentChargeEventSchema>;
