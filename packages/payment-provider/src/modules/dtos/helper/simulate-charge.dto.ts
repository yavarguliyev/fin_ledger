import { z } from 'zod';

import { ChargePaymentSchema } from '../operation/charge-payment.dto';

export const SimulateChargeSchema = z.object({
  dto: ChargePaymentSchema,

  provider: z.string({ message: 'Provider must be a string' })
});

export type SimulateChargeDto = z.infer<typeof SimulateChargeSchema>;
