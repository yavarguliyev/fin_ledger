import { z } from 'zod';

export const WebhookTokenSchema = z.object({
  authorization: z.string().optional(),
  expected: z.string().optional()
});

export type WebhookTokenDto = z.infer<typeof WebhookTokenSchema>;
