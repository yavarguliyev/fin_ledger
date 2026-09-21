import { z } from 'zod';
import type { PaymentMethod } from 'stripe';

export const StripePaymentMethodSchema = z.object({
  paymentMethod: z.custom<PaymentMethod>()
});

export type StripePaymentMethodDto = z.infer<typeof StripePaymentMethodSchema>;
