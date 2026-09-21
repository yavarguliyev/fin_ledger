import { z } from 'zod';

import { PaymentAnalyticsEventPayloadDto, PaymentAnalyticsEventPayloadSchema } from '../../../payment/dtos/analytics/payment-analytics-event.dto';

export const EmitPaymentAnalyticsSchema = PaymentAnalyticsEventPayloadSchema.extend({
  isCompleted: z.boolean({ message: 'Is completed must be a boolean' }),

  publishPaymentCompleted: z.custom<(payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>>(),

  publishPaymentFailed: z.custom<(payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>>()
});

export type EmitPaymentAnalyticsDto = z.infer<typeof EmitPaymentAnalyticsSchema>;
