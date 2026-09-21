import { z } from 'zod';
import { CacheKey, CacheTTL } from '@common/shared-libs';

export const CacheableOptionsSchema = z.object({
  keyPrefix: z.custom<CacheKey>(),

  ttlSeconds: z.custom<CacheTTL>().optional()
});

export type CacheableOptionsDto = z.infer<typeof CacheableOptionsSchema>;
