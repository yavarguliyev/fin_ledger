import { z } from 'zod';
import { AGGREGATE_TYPES, OutboxDestination } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const CreateEventSchema = z.object({
  aggregateId: z.string({ message: 'Aggregate ID must be a string' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  aggregateType: z.enum(AGGREGATE_TYPES, { message: 'Aggregate type must be a valid aggregate type' }),

  eventType: z.string({ message: 'Event type must be a string' }).min(1, { message: 'Event type is required' }),

  destination: z.enum(OutboxDestination, { message: 'Destination must be a valid OutboxDestination enum' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;
