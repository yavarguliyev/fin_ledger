import { z } from 'zod';

export const EnvelopeHeadersSchema = z.object({
  eventId: z.string({ message: 'Event ID must be a string' }),

  eventType: z.string({ message: 'Event type must be a string' }),

  occurredAt: z.date({ message: 'Occurred at must be a date' }),

  correlationId: z.string({ message: 'Correlation ID must be a string' }).optional()
});

export type EnvelopeHeadersDto = z.infer<typeof EnvelopeHeadersSchema>;
