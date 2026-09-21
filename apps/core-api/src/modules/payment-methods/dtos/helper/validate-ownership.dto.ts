import { z } from 'zod';

import { PaymentMethodSchema } from '../payment-method/payment-method.dto';

export const ValidateOwnershipSchema = z.object({
  method: PaymentMethodSchema.nullable(),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type ValidateOwnershipDto = z.infer<typeof ValidateOwnershipSchema>;
