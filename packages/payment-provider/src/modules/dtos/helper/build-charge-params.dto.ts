import { z } from 'zod';

import { ChargePaymentSchema } from '../operation/charge-payment.dto';

export const BuildChargeParamsSchema = z.object({
  dto: ChargePaymentSchema,

  customerId: z.string().optional()
});

export type BuildChargeParamsDto = z.infer<typeof BuildChargeParamsSchema>;
