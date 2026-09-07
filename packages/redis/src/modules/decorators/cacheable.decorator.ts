import { AsyncMethod } from '@common/shared-libs';

import { CacheableOptions } from '../interfaces/redis.interface';
import { resolveProvider, buildCacheKey, tryGetCached, tryCacheResult } from '../utils/cache.util';

export const Cacheable = (options: CacheableOptions): MethodDecorator => {
  return (_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value as AsyncMethod;
    const methodName = String(propertyKey);

    descriptor.value = async function (this: Record<string | symbol, unknown>, ...args: unknown[]): Promise<unknown> {
      const provider = resolveProvider(this);
      if (!provider) return originalMethod.apply(this, args);

      const cacheKey = buildCacheKey(options.keyPrefix, methodName, args);
      const result = await tryGetCached(provider, cacheKey);
      if (result.hit) return result.value;

      const freshValue = await originalMethod.apply(this, args);
      await tryCacheResult(provider, cacheKey, freshValue, options.ttlSeconds);
      return freshValue;
    };
  };
};
