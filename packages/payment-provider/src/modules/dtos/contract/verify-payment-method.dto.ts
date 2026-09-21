import { z } from 'zod';

export const VerifyPaymentMethodSchema = z.object({
  paymentMethodToken: z.string({ message: 'Payment method token must be a string' })
});

export type VerifyPaymentMethodDto = z.infer<typeof VerifyPaymentMethodSchema>;
