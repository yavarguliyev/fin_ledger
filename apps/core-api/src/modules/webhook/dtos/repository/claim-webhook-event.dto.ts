import { z } from 'zod';

import { WebhookEventRecordSchema } from '../webhook-event/webhook-event.dto';

export const ClaimWebhookEventSchema = WebhookEventRecordSchema.pick({
  eventId: true,
  provider: true,
  eventType: true,
  payload: true,
  signatureVerified: true
});

export type ClaimWebhookEventDto = z.infer<typeof ClaimWebhookEventSchema>;
