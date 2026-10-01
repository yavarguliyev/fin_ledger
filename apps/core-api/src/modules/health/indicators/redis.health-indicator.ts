import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService, HealthIndicatorResult } from '@nestjs/terminus';
import { BaseHelper, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { HEALTH } from '../constants/health.constant';

@Injectable()
export class RedisHealthIndicator {
  constructor (
    @Inject(REDIS_CACHE_PROVIDER) private readonly cache: RedisCacheProvider,
    private readonly indicator: HealthIndicatorService
  ) {}

  async isHealthy (): Promise<HealthIndicatorResult> {
    const check = this.indicator.check(HEALTH.REDIS_KEY);

    try {
      await this.cache.set({ key: HEALTH.PROBE_KEY, value: HEALTH.PROBE_KEY, ttlSeconds: HEALTH.PROBE_TTL_SECONDS });
      const reachable = await this.cache.exists({ key: HEALTH.PROBE_KEY });
      return reachable ? check.up() : check.down({ message: 'Redis did not return the probe key' });
    } catch (error) {
      return check.down({ message: BaseHelper.errorResponse({ error }).message });
    }
  }
}
