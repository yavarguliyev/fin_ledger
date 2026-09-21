import { z } from 'zod';
import { OutboxRepository, PaymentType } from '@common/libs';

import { PaymentSchema } from '../payment/payment.dto';
import { ProcessPaymentSchema } from '../input/process-payment.dto';
import { PaymentAnalyticsEventPayloadDto } from '../analytics/payment-analytics-event.dto';

export const PublishPaymentEventsSchema = z.object({
  payment: PaymentSchema,

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  dto: ProcessPaymentSchema,

  updated: PaymentSchema,

  paymentType: z.enum(PaymentType, { message: 'Payment type must be a valid payment type' }),

  outboxRepository: z.custom<OutboxRepository>(),

  publishPaymentCompleted: z.custom<(payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>>(),

  publishPaymentFailed: z.custom<(payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>>()
});

export type PublishPaymentEventsDto = z.infer<typeof PublishPaymentEventsSchema>;
