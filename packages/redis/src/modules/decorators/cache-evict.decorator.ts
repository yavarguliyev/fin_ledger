import { AsyncMethod, UnknownRecord } from '@common/shared-libs';

import { CacheEvictOptionsDto } from '../dtos/decorator/cache-evict-options.dto';
import { CacheHelper } from '../helpers/cache.helper';

export const CacheEvict = (options: CacheEvictOptionsDto): MethodDecorator => {
  return (_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value as AsyncMethod;
    const currentMethodName = String(propertyKey);

    descriptor.value = async function (this: UnknownRecord, ...args: unknown[]): Promise<unknown> {
      const result = await originalMethod.apply(this, args);
      const provider = CacheHelper.resolveProvider({ target: this });

      if (!provider) return result;

      if (options.isPattern === true) {
        const scope = options.scope?.(args);

        await Promise.all(
          options.keyPrefix.map(keyPrefix => CacheHelper.tryEvictCache({ provider, keyPrefix: scope ? `${keyPrefix}:${scope}:*` : `${keyPrefix}:*`, isPattern: true }))
        );
      } else {
        const targetMethod = options.targetMethodName || currentMethodName;
        const evictionArgs = options.targetMethodName ? [args[0]] : args;

        await Promise.all(
          options.keyPrefix.map(keyPrefix =>
            CacheHelper.tryEvictCache({
              provider,
              keyPrefix: CacheHelper.buildCacheKey({ prefix: keyPrefix, method: targetMethod, args: evictionArgs }),
              isPattern: false
            })
          )
        );
      }

      return result;
    };
  };
};
