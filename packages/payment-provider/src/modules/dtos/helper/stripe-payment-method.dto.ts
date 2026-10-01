import { z } from 'zod';
import type { PaymentMethod } from 'stripe';

export const StripePaymentMethodSchema: z.ZodObject<{ paymentMethod: z.ZodCustom<PaymentMethod, PaymentMethod> }> = z.object({
  paymentMethod: z.custom<PaymentMethod>()
});

export type StripePaymentMethodDto = z.infer<typeof StripePaymentMethodSchema>;
