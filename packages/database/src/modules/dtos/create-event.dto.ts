import { z } from 'zod';
import { AGGREGATE_TYPES, DomainEventType } from '@common/shared-libs';

export const CreateEventSchema = z.object({
  aggregateId: z.string({ message: 'Aggregate ID must be a string' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  aggregateType: z.enum(AGGREGATE_TYPES, { message: 'Aggregate type must be a valid aggregate type' }),

  eventType: z.enum(Object.values(DomainEventType) as [string, ...string[]], { message: 'Event type must be a valid domain event type' })
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;
