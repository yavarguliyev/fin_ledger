import { z } from 'zod';

import { CacheProvider } from '../../interfaces/cache-provider.interface';

export const TryCacheResultSchema = z.object({
  provider: z.custom<CacheProvider>(),

  key: z.string({ message: 'Key must be a string' }),

  value: z.unknown(),

  ttl: z.number({ message: 'TTL must be a number' }).optional()
});

export type TryCacheResultDto = z.infer<typeof TryCacheResultSchema>;
