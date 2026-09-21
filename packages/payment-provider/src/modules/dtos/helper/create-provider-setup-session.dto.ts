import { z } from 'zod';
import type Stripe from 'stripe';

import { CreateSetupSessionSchema } from '../operation/create-setup-session.dto';

export const CreateProviderSetupSessionSchema = z.object({
  client: z.custom<Stripe>(),

  session: CreateSetupSessionSchema
});

export type CreateProviderSetupSessionDto = z.infer<typeof CreateProviderSetupSessionSchema>;
