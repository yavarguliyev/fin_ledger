import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { WebhookEventRecordSchema } from '../webhook-event/webhook-event.dto';

export const RecordWebhookEventSchema = WebhookEventRecordSchema.pick({
  eventId: true,
  provider: true,
  eventType: true,
  payload: true,
  status: true,
  signatureVerified: true,
  processedAt: true
}).extend({
  adapter: z.custom<DatabaseAdapter>().optional()
});

export type RecordWebhookEventDto = z.infer<typeof RecordWebhookEventSchema>;
