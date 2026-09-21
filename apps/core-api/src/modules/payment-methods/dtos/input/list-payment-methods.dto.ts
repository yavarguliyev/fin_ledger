import { z } from 'zod';

import { ListPaymentMethodsRequestSchema } from '../request/list-payment-methods-request.dto';

export const ListPaymentMethodsSchema = ListPaymentMethodsRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type ListPaymentMethodsDto = z.infer<typeof ListPaymentMethodsSchema>;
