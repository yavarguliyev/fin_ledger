import { z } from 'zod';
import { PaymentMethodStatus } from '@common/libs';

import { PaymentMethodIdRequestSchema } from '../request/payment-method-id-request.dto';

export const UpdatePaymentMethodStatusSchema = PaymentMethodIdRequestSchema.extend({
  status: z.enum(PaymentMethodStatus, { message: 'Invalid payment method status' })
});

export type UpdatePaymentMethodStatusDto = z.infer<typeof UpdatePaymentMethodStatusSchema>;
