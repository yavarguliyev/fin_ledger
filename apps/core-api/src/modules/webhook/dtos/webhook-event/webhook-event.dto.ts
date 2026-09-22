import { z } from 'zod';
import { WebhookStatus } from '@common/libs';

export const WebhookEventRecordSchema = z.object({
  signatureVerified: z.boolean({ message: 'Signature verified must be a boolean' }).optional(),

  processedAt: z.string({ message: 'Processed at must be a string' }).nullable().optional(),

  id: z.string({ message: 'ID must be a string' }),

  eventId: z.string({ message: 'Event ID must be a string' }),

  provider: z.string({ message: 'Provider must be a string' }),

  eventType: z.string({ message: 'Event type must be a string' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  status: z.enum(WebhookStatus, { message: 'Status must be a valid webhook status' }),

  attempts: z.number({ message: 'Attempts must be a number' }).int().optional(),

  createdAt: z.date({ message: 'Created at must be a valid date' })
});

export type WebhookEventRecordDto = z.infer<typeof WebhookEventRecordSchema>;
