import { z } from 'zod';
import type Stripe from 'stripe';

import { FindChargeByMetadataSchema } from '../operation/find-charge-by-metadata.dto';

export const StripeFindIntentSchema = z.object({
  client: z.custom<Stripe>(),

  dto: FindChargeByMetadataSchema
});

export type StripeFindIntentDto = z.infer<typeof StripeFindIntentSchema>;
