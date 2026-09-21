import { z } from 'zod';

import { PaymentUpdateSchema } from '../payment/payment-update.dto';

export const UpdatePaymentStatusSchema = PaymentUpdateSchema.extend({
  paymentId: z.string({ message: 'Payment ID must be a string' })
});

export type UpdatePaymentStatusDto = z.infer<typeof UpdatePaymentStatusSchema>;
