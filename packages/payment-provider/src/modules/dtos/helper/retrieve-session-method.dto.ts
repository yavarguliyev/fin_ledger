import { z } from 'zod';
import type Stripe from 'stripe';

export const RetrieveSessionMethodSchema = z.object({
  client: z.custom<Stripe>(),

  sessionId: z.string({ message: 'Session ID must be a string' })
});

export type RetrieveSessionMethodDto = z.infer<typeof RetrieveSessionMethodSchema>;
