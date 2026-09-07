import { z } from 'zod';

export const RemovePaymentMethodSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' })
});

export type RemovePaymentMethodDto = z.infer<typeof RemovePaymentMethodSchema>;
