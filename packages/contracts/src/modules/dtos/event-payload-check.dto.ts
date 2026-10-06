import { z } from 'zod';

export const EventPayloadCheckSchema = z.object({
  eventType: z.string({ message: 'Event type must be a string' }).min(1),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' })
});

export type EventPayloadCheckDto = z.infer<typeof EventPayloadCheckSchema>;
