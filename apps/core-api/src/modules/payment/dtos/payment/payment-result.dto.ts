import { z } from 'zod';

import { PaymentSchema } from './payment.dto';

export const PaymentResultSchema = PaymentSchema.extend({
  clientSecret: z.string({ message: 'Client secret must be a string' }).optional()
});

export type PaymentResultDto = z.infer<typeof PaymentResultSchema>;
