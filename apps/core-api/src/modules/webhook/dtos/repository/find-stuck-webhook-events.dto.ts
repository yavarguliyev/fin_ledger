import { z } from 'zod';

export const FindStuckWebhookEventsSchema = z.object({
  receivedBefore: z.string({ message: 'Received before must be an ISO timestamp' }),

  maxAttempts: z.number().int().positive(),

  limit: z.number().int().positive()
});

export type FindStuckWebhookEventsDto = z.infer<typeof FindStuckWebhookEventsSchema>;
