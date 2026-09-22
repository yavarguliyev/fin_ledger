import { z } from 'zod';

import { RedisCacheProvider } from '../../services/redis-cache-provider.class';

export const RedisThrottlerStorageOptionsSchema = z.object({
  redis: z.custom<RedisCacheProvider>()
});

export type RedisThrottlerStorageOptionsDto = z.infer<typeof RedisThrottlerStorageOptionsSchema>;
