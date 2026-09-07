import { AsyncMethod, UnknownRecord } from '@common/shared-libs';

import { CacheEvictOptions } from '../interfaces/redis.interface';
import { resolveProvider, tryEvictCache, buildCacheKey } from '../utils/cache.util';

export const CacheEvict = (options: CacheEvictOptions): MethodDecorator => {
  return (_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value as AsyncMethod;
    const currentMethodName = String(propertyKey);

    descriptor.value = async function (this: UnknownRecord, ...args: unknown[]): Promise<unknown> {
      const result = await originalMethod.apply(this, args);
      const provider = resolveProvider(this);

      if (!provider) return result;

      if (options.isPattern === true) {
        await Promise.all(options.keyPrefix.map(keyPrefix => tryEvictCache(provider, `${keyPrefix}:*`, true)));
      } else {
        const targetMethod = options.targetMethodName || currentMethodName;
        const evictionArgs = options.targetMethodName ? [args[0]] : args;

        await Promise.all(options.keyPrefix.map(keyPrefix => tryEvictCache(provider, buildCacheKey(keyPrefix, targetMethod, evictionArgs), false)));
      }

      return result;
    };
  };
};
