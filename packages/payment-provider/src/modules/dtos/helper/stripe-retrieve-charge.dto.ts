import { z } from 'zod';
import type Stripe from 'stripe';

import { RetrieveChargeSchema } from '../operation/retrieve-charge.dto';

export const StripeRetrieveChargeSchema = z.object({
  client: z.custom<Stripe>(),

  dto: RetrieveChargeSchema
});

export type StripeRetrieveChargeDto = z.infer<typeof StripeRetrieveChargeSchema>;
