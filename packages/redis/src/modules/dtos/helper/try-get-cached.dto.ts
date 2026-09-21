import { z } from 'zod';

import { CacheProvider } from '../../interfaces/cache-provider.interface';

export const TryGetCachedSchema = z.object({
  provider: z.custom<CacheProvider>(),

  cacheKey: z.string({ message: 'Cache key must be a string' })
});

export type TryGetCachedDto = z.infer<typeof TryGetCachedSchema>;
