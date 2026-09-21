import { z } from 'zod';
import { AGGREGATE_TYPES, DatabaseAdapter, DomainEventType, OutboxRepository } from '@common/libs';

import { AnalyticsEventPayloadSchema } from '../../../analytics/dtos/payload/analytics-event-payload.dto';

export const CreateWalletEventSchema = z.object({
  eventPayload: AnalyticsEventPayloadSchema,

  aggregateType: z.enum(AGGREGATE_TYPES, { message: 'Aggregate type must be a valid aggregate type' }),

  eventType: z.enum(DomainEventType, { message: 'Event type must be a valid domain event type' }),

  outboxRepository: z.custom<OutboxRepository>(),

  adapter: z.custom<DatabaseAdapter>()
});

export type CreateWalletEventDto = z.infer<typeof CreateWalletEventSchema>;
