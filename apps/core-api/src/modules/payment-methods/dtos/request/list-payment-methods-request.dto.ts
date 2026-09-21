import { z } from 'zod';
import { PaymentMethodStatus } from '@common/libs';

export const ListPaymentMethodsRequestSchema = z.object({
  status: z.enum(PaymentMethodStatus, { message: 'Invalid payment method status' }).optional()
});

export type ListPaymentMethodsRequestDto = z.infer<typeof ListPaymentMethodsRequestSchema>;
