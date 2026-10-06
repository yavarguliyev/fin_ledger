import { z } from 'zod';

export const EventEnvelopeSchema = z.object({
  type: z.string({ message: 'Type must be a string' }).min(1, { message: 'Type is required' }),

  version: z.coerce.number({ message: 'Version must be a number' }).int().positive({ message: 'Version must be positive' }),

  id: z.uuid({ message: 'ID must be a UUID' }),

  occurredAt: z.iso.datetime({ offset: true, message: 'Occurred at must be an ISO date-time' }),

  correlationId: z.string({ message: 'Correlation ID must be a string' }).optional()
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
