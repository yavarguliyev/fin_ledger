import { z } from 'zod';
import { DatabaseAdapter, PaymentStatus } from '@common/libs';

import { PaymentUpdateSchema } from '../payment/payment-update.dto';

export const UpdatePaymentStatusSchema = PaymentUpdateSchema.extend({
  paymentId: z.string({ message: 'Payment ID must be a string' }),

  status: z.enum(PaymentStatus, { message: 'Payment status must be a valid payment status' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type UpdatePaymentStatusDto = z.infer<typeof UpdatePaymentStatusSchema>;
