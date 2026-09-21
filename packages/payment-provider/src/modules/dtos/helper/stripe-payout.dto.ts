import { z } from 'zod';
import type Stripe from 'stripe';

import { PayoutFundsSchema } from '../operation/payout-funds.dto';

export const StripePayoutSchema = z.object({
  client: z.custom<Stripe>(),

  dto: PayoutFundsSchema
});

export type StripePayoutDto = z.infer<typeof StripePayoutSchema>;
