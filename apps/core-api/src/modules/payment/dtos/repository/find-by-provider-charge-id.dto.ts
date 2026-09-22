import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FindByProviderChargeIdSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FindByProviderChargeIdDto = z.infer<typeof FindByProviderChargeIdSchema>;
