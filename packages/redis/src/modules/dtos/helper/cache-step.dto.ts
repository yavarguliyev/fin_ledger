import { z } from 'zod';

import { CacheProvider } from '../../interfaces/cache-provider.interface';

export const CacheStepSchema = z.object({
  provider: z.custom<CacheProvider>(),

  input: z.unknown(),

  run: z.custom<() => Promise<unknown>>()
});

export type CacheStepDto = z.infer<typeof CacheStepSchema>;
