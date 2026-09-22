import { z } from 'zod';

import { WebhookEventRecordSchema } from '../webhook-event/webhook-event.dto';

export const ReplayWebhookEventSchema = z.object({
  event: WebhookEventRecordSchema
});

export type ReplayWebhookEventDto = z.infer<typeof ReplayWebhookEventSchema>;
