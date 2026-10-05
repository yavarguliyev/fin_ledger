import { z } from 'zod';
import type Stripe from 'stripe';

export const StripePaymentMethodSchema: z.ZodObject<{ paymentMethod: z.ZodCustom<Stripe.PaymentMethod, Stripe.PaymentMethod> }> = z.object({
  paymentMethod: z.custom<Stripe.PaymentMethod>()
});

export type StripePaymentMethodDto = z.infer<typeof StripePaymentMethodSchema>;
