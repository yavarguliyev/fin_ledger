import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FindByProviderMethodIdSchema = z.object({
  provider: z.string({ message: 'Provider must be a string' }),

  providerMethodId: z.string({ message: 'Provider method ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FindByProviderMethodIdDto = z.infer<typeof FindByProviderMethodIdSchema>;
