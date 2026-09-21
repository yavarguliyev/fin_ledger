import { z } from 'zod';

import type { RedisCacheConfig } from '../../interfaces/redis-cache-config.interface';

export const RedisConfigRefSchema = z.object({
  config: z.custom<RedisCacheConfig>()
});

export type RedisConfigRefDto = z.infer<typeof RedisConfigRefSchema>;
