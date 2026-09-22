import { z } from 'zod';

import { PaymentSchema } from '../payment/payment.dto';

export const PaymentRefSchema = z.object({
  payment: PaymentSchema
});

export type PaymentRefDto = z.infer<typeof PaymentRefSchema>;
