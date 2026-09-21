import { z } from 'zod';

export const FindByProviderMethodIdSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }),

  providerMethodId: z.string({ message: 'Provider method ID must be a string' })
});

export type FindByProviderMethodIdDto = z.infer<typeof FindByProviderMethodIdSchema>;
