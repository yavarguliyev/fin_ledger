import { z } from 'zod';
import { DatabaseAdapter, WebhookStatus } from '@common/libs';

export const MarkWebhookEventSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  status: z.enum(WebhookStatus, { message: 'Status must be a valid webhook status' }),

  adapter: z.custom<DatabaseAdapter>()
});

export type MarkWebhookEventDto = z.infer<typeof MarkWebhookEventSchema>;
