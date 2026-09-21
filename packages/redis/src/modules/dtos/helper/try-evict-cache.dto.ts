import { z } from 'zod';

import { CacheProvider } from '../../interfaces/cache-provider.interface';

export const TryEvictCacheSchema = z.object({
  provider: z.custom<CacheProvider>(),

  keyPrefix: z.string({ message: 'Key prefix must be a string' }),

  isPattern: z.boolean({ message: 'isPattern must be a boolean' })
});

export type TryEvictCacheDto = z.infer<typeof TryEvictCacheSchema>;
