import { z } from 'zod';
import type Stripe from 'stripe';

import { ChargePaymentSchema } from '../operation/charge-payment.dto';

export const ResolveCustomerChargeSchema = z.object({
  client: z.custom<Stripe>(),

  dto: ChargePaymentSchema
});

export type ResolveCustomerChargeDto = z.infer<typeof ResolveCustomerChargeSchema>;
