import { z } from 'zod';
import { PaymentStatus } from '@common/libs';

import { MarkIndeterminateSchema } from './mark-indeterminate.dto';

export const KeepPaymentOpenSchema = MarkIndeterminateSchema.extend({
  status: z.enum(PaymentStatus, { message: 'Payment status must be a valid payment status' })
});

export type KeepPaymentOpenDto = z.infer<typeof KeepPaymentOpenSchema>;
