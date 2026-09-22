import { z } from 'zod';
import { PaymentIntent } from 'stripe';

export const StripeIntentSchema = z.object({
  intent: z.custom<PaymentIntent>()
});

export type StripeIntentDto = z.infer<typeof StripeIntentSchema>;
