import { z } from 'zod';

import { PaymentMethodIdRequestSchema } from '../request/payment-method-id-request.dto';

export const PaymentMethodByUserSchema = PaymentMethodIdRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type PaymentMethodByUserDto = z.infer<typeof PaymentMethodByUserSchema>;
