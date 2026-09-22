import { z } from 'zod';

import { PaymentSchema } from '../payment/payment.dto';
import { PaymentAnalyticsEventPayloadDto } from '../analytics/payment-analytics-event.dto';

export const EmitCompletedAnalyticsSchema = z.object({
  payment: PaymentSchema,

  publishPaymentCompleted: z.custom<(payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>>(),

  publishPaymentFailed: z.custom<(payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>>()
});

export type EmitCompletedAnalyticsDto = z.infer<typeof EmitCompletedAnalyticsSchema>;
