import { z } from 'zod';

import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

export const ValidateAndGetPaymentMethodSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  paymentMethodId: z.string({ message: 'Payment method ID must be a string' }).optional(),

  paymentMethodRepository: z.custom<PaymentMethodRepository>()
});

export type ValidateAndGetPaymentMethodDto = z.infer<typeof ValidateAndGetPaymentMethodSchema>;
