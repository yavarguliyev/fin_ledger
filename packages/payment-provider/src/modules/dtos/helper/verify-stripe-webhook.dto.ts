import { z } from 'zod';
import type Stripe from 'stripe';

export const VerifyStripeWebhookSchema = z.object({
  client: z.custom<Stripe>(),

  secret: z.string({ message: 'Secret must be a string' }),

  payload: z.custom<Buffer | string>(),

  signature: z.string({ message: 'Signature must be a string' })
});

export type VerifyStripeWebhookDto = z.infer<typeof VerifyStripeWebhookSchema>;
