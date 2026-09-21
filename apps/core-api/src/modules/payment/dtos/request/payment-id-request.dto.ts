import { z } from 'zod';

export const PaymentIdRequestSchema = z.object({
  id: z.string({ message: 'Payment ID must be a string' }).min(1, { message: 'Payment ID is required' })
});

export type PaymentIdRequestDto = z.infer<typeof PaymentIdRequestSchema>;
