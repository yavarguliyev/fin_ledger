import { z } from 'zod';

import { PaymentSchema } from '../payment/payment.dto';
import { PaymentAnalyticsEventPayloadSchema } from '../analytics/payment-analytics-event.dto';

export const HandlePaymentResultSchema = z.object({
  updated: PaymentSchema,

  eventPayload: PaymentAnalyticsEventPayloadSchema,

  isCompleted: z.boolean({ message: 'Is completed must be a boolean' })
});

export type HandlePaymentResultDto = z.infer<typeof HandlePaymentResultSchema>;
