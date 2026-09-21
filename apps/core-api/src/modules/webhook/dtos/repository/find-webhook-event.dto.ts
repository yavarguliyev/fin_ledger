import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FindWebhookEventSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }).min(1, { message: 'Provider is required' }),

  eventId: z.string({ message: 'Event ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FindWebhookEventDto = z.infer<typeof FindWebhookEventSchema>;
