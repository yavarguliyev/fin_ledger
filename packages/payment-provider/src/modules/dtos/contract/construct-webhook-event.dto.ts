import { z } from 'zod';

export const ConstructWebhookEventSchema = z.object({
  payload: z.custom<Buffer | string>(),

  signature: z.string({ message: 'Signature must be a string' })
});

export type ConstructWebhookEventDto = z.infer<typeof ConstructWebhookEventSchema>;
