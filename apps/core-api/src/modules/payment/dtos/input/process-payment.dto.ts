import { z } from 'zod';

import { RequestPaymentSchema } from '../request/request-payment.dto';

export const ProcessPaymentSchema = RequestPaymentSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type ProcessPaymentDto = z.infer<typeof ProcessPaymentSchema>;
