import { z } from 'zod';
import type Stripe from 'stripe';

import { RefundPaymentSchema } from '../operation/refund-payment.dto';

export const StripeRefundSchema = z.object({
  client: z.custom<Stripe>(),

  dto: RefundPaymentSchema
});

export type StripeRefundDto = z.infer<typeof StripeRefundSchema>;
