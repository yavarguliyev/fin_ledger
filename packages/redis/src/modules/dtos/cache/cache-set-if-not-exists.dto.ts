import { z } from 'zod';

import { CacheSetSchema } from './cache-set.dto';

export const CacheSetIfNotExistsSchema = CacheSetSchema.extend({
  ttlSeconds: z.number({ message: 'TTL must be a number' }).int().positive()
});

export type CacheSetIfNotExistsDto = z.infer<typeof CacheSetIfNotExistsSchema>;
