import { z } from 'zod';
import { OutboxDestination } from '@common/shared-libs';

export const PublishOutboxEventSchema = z.object({
  eventId: z.string({ message: 'Event ID must be a string' }),

  eventType: z.string({ message: 'Event type must be a string' }).min(1, { message: 'Event type is required' }),

  destination: z.enum(OutboxDestination, { message: 'Destination must be a valid OutboxDestination enum' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  attempts: z.number({ message: 'Attempts must be a number' }).int().nonnegative()
});

export type PublishOutboxEventDto = z.infer<typeof PublishOutboxEventSchema>;
