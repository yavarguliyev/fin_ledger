import { z } from 'zod';
import { AggregateType, BETTING_TYPES, DatabaseAdapter, DomainEventType, OutboxRepository } from '@common/libs';

import { PaymentAnalyticsEventPayloadDto } from '../../payment/dtos/analytics/payment-analytics-event.dto';

export const AnalyticsEventPayloadSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount minor must be a number' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  timestamp: z.string({ message: 'Timestamp must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }).optional(),

  reference: z.string({ message: 'Reference must be a string' }).optional(),

  conversionId: z.string({ message: 'Conversion ID must be a string' }).optional(),

  type: z.enum(BETTING_TYPES).optional()
});

export type AnalyticsEventPayload = z.infer<typeof AnalyticsEventPayloadSchema> & { transactionId: string };

export type AnalyticsEventPayloadDto = z.infer<typeof AnalyticsEventPayloadSchema>;

export type WalletAnalyticsEventDto = AnalyticsEventPayloadDto & {
  eventType: DomainEventType;
  publishWalletCredited: (payload: AnalyticsEventPayloadDto) => Promise<AnalyticsEventPayloadDto>;
  publishWalletDebited: (payload: AnalyticsEventPayloadDto) => Promise<AnalyticsEventPayloadDto>;
};

export type PaymentAnalyticsEventDto = PaymentAnalyticsEventPayloadDto & {
  isCompleted: boolean;
  publishPaymentCompleted: (payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>;
  publishPaymentFailed: (payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>;
};

export type CreateEventDto = {
  eventPayload: AnalyticsEventPayload;
  aggregateType: AggregateType;
  eventType: DomainEventType;
  outboxRepository: OutboxRepository;
  tx: DatabaseAdapter;
};
