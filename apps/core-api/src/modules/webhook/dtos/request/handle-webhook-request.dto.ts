import { z } from 'zod';

export const HandleWebhookRequestSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }).min(1, { message: 'Provider is required' })
});

export type HandleWebhookRequestDto = z.infer<typeof HandleWebhookRequestSchema>;
