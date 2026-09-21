import { z } from 'zod';

export const ProcessWebhookResponseSchema = z.object({
  received: z.boolean({ message: 'Received must be a boolean' }),

  eventId: z.string({ message: 'Event ID must be a string' }).optional()
});

export type ProcessWebhookResponseDto = z.infer<typeof ProcessWebhookResponseSchema>;
