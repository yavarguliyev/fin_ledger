import { z } from 'zod';
import { PaymentMethodStatus } from '@common/libs';

export const HandlePaymentMethodEventSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }).min(1, { message: 'Provider is required' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  status: z.enum(PaymentMethodStatus, { message: 'Status must be a valid payment method status' })
});

export type HandlePaymentMethodEventDto = z.infer<typeof HandlePaymentMethodEventSchema>;
