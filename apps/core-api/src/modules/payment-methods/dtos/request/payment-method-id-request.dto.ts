import { z } from 'zod';

export const PaymentMethodIdRequestSchema = z.object({
  id: z.string({ message: 'ID must be a string' }).min(1, { message: 'ID is required' })
});

export type PaymentMethodIdRequestDto = z.infer<typeof PaymentMethodIdRequestSchema>;
