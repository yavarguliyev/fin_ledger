import { z } from 'zod';

export const ConsumedMessageSchema = z.object({
  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  eventId: z.string({ message: 'Event ID must be a string' }).optional()
});

export type ConsumedMessageDto = z.infer<typeof ConsumedMessageSchema>;
