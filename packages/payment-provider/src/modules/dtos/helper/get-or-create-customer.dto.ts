import { z } from 'zod';
import type Stripe from 'stripe';

export const GetOrCreateCustomerSchema = z.object({
  client: z.custom<Stripe>(),

  email: z.string().optional()
});

export type GetOrCreateCustomerDto = z.infer<typeof GetOrCreateCustomerSchema>;
