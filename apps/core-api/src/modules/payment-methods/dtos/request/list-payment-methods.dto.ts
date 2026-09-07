import { z } from 'zod';
import { PaymentMethodStatus } from '@common/libs';

export const ListPaymentMethodsSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),
  status: z.enum(PaymentMethodStatus, { message: 'Invalid payment method type' }).optional()
});

export type ListPaymentMethodsDto = z.infer<typeof ListPaymentMethodsSchema>;
