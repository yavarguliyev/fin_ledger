import { z } from 'zod';
import type { PaymentIntent } from 'stripe';

export const StripeIntentSchema: z.ZodObject<{ intent: z.ZodCustom<PaymentIntent, PaymentIntent> }> = z.object({
  intent: z.custom<PaymentIntent>()
});

export type StripeIntentDto = z.infer<typeof StripeIntentSchema>;
