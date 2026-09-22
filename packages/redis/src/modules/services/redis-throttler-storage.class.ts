import { ThrottlerStorage } from '@nestjs/throttler';
import { TIME_UNITS } from '@common/shared-libs';

import { RedisCacheProvider } from './redis-cache-provider.class';
import { RedisThrottlerStorageOptionsDto } from '../dtos/rate-limit/redis-throttler-storage-options.dto';
import { RATE_LIMIT_KEYS } from '../constants/rate-limit/rate-limit-keys.constant';

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly redis: RedisCacheProvider;

  constructor ({ redis }: RedisThrottlerStorageOptionsDto) {
    this.redis = redis;
  }

  async increment (key: string, ttl: number, limit: number, blockDuration: number): ReturnType<ThrottlerStorage['increment']> {
    const hit = await this.redis.hitRateLimit({ key: `${RATE_LIMIT_KEYS.PREFIX}${key}`, ttlMs: ttl, limit, blockDurationMs: blockDuration });

    return {
      totalHits: hit.totalHits,
      timeToExpire: Math.ceil(hit.timeToExpireMs / TIME_UNITS.MS_PER_SECOND),
      isBlocked: hit.timeToBlockExpireMs > 0,
      timeToBlockExpire: Math.max(0, Math.ceil(hit.timeToBlockExpireMs / TIME_UNITS.MS_PER_SECOND))
    };
  }
}
