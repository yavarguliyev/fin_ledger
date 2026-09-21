import { z } from 'zod';

export const FindByProviderChargeIdSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' })
});

export type FindByProviderChargeIdDto = z.infer<typeof FindByProviderChargeIdSchema>;
