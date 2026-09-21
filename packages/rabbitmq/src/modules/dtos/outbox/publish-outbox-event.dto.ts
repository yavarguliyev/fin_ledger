import { z } from 'zod';
import { DomainEventType } from '@common/shared-libs';

export const PublishOutboxEventSchema = z.object({
  eventId: z.string({ message: 'Event ID must be a string' }),

  eventType: z.enum(DomainEventType, { message: 'Event type must be a valid domain event type' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' })
});

export type PublishOutboxEventDto = z.infer<typeof PublishOutboxEventSchema>;
