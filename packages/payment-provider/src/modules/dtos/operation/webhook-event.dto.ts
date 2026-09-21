import { z } from 'zod';
import { PaymentProvider } from '@common/shared-libs';

export const WebhookEventSchema = z.object({
  eventId: z.string({ message: 'Event ID must be a string' }),

  eventType: z.string({ message: 'Event type must be a string' }),

  provider: z.enum(PaymentProvider),

  payload: z.record(z.string(), z.unknown()),

  signature: z.string().optional(),

  signatureVerified: z.boolean()
});

export type WebhookEventDto = z.infer<typeof WebhookEventSchema>;
