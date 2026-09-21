import { z } from 'zod';

export const DispatchWebhookEventSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }).min(1, { message: 'Provider is required' }),

  eventType: z.string({ message: 'Event type must be a string' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' })
});

export type DispatchWebhookEventDto = z.infer<typeof DispatchWebhookEventSchema>;
