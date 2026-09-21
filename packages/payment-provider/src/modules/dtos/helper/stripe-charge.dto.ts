import { z } from 'zod';
import type Stripe from 'stripe';

import { ChargePaymentSchema } from '../operation/charge-payment.dto';

export const StripeChargeSchema = z.object({
  client: z.custom<Stripe>(),

  dto: ChargePaymentSchema
});

export type StripeChargeDto = z.infer<typeof StripeChargeSchema>;
