import { AsyncMethod } from '@common/shared-libs';

import { CacheableOptionsDto } from '../dtos/decorator/cacheable-options.dto';
import { CacheHelper } from '../helpers/cache.helper';

export const Cacheable = (options: CacheableOptionsDto): MethodDecorator => {
  return (_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value as AsyncMethod;
    const methodName = String(propertyKey);

    descriptor.value = async function (this: Record<string | symbol, unknown>, ...args: unknown[]): Promise<unknown> {
      const provider = CacheHelper.resolveProvider({ target: this });
      if (!provider) return originalMethod.apply(this, args);

      const cacheKey = CacheHelper.buildCacheKey({ prefix: options.keyPrefix, method: methodName, args });
      const result = await CacheHelper.tryGetCached({ provider, cacheKey });
      if (result.hit) return result.value;

      const freshValue = await originalMethod.apply(this, args);
      await CacheHelper.tryCacheResult({ provider, key: cacheKey, value: freshValue, ttl: options.ttlSeconds });
      return freshValue;
    };
  };
};
