import { z } from 'zod';
import type Stripe from 'stripe';

export const StripeIntentSchema: z.ZodObject<{ intent: z.ZodCustom<Stripe.PaymentIntent, Stripe.PaymentIntent> }> = z.object({
  intent: z.custom<Stripe.PaymentIntent>()
});

export type StripeIntentDto = z.infer<typeof StripeIntentSchema>;
