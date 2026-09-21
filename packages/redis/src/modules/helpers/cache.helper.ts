import { REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { CacheProvider } from '../interfaces/cache-provider.interface';
import { GetCachedKey } from '../interfaces/get-cached-key.interface';
import { BuildCacheKeyDto } from '../dtos/helper/build-cache-key.dto';
import { ResolveProviderDto } from '../dtos/helper/resolve-provider.dto';
import { TryCacheResultDto } from '../dtos/helper/try-cache-result.dto';
import { TryEvictCacheDto } from '../dtos/helper/try-evict-cache.dto';
import { TryGetCachedDto } from '../dtos/helper/try-get-cached.dto';

export class CacheHelper {
  static async tryCacheResult ({ provider, key, value, ttl }: TryCacheResultDto): Promise<void> {
    await provider.set({ key, value, ...(ttl !== undefined && { ttlSeconds: ttl }) });
  }

  static resolveProvider ({ target }: ResolveProviderDto): CacheProvider | null {
    return (target[REDIS_CACHE_PROVIDER] as CacheProvider | undefined) ?? null;
  }

  static async tryGetCached<T> ({ provider, cacheKey }: TryGetCachedDto): Promise<GetCachedKey<T>> {
    const cached = await provider.get<T>({ key: cacheKey });
    if (cached !== null) return { hit: true, value: cached };
    return { hit: false, value: null };
  }

  static async tryEvictCache ({ provider, keyPrefix, isPattern }: TryEvictCacheDto): Promise<void> {
    if (isPattern) {
      await provider.invalidatePattern({ pattern: keyPrefix.endsWith('*') ? keyPrefix : `${keyPrefix}:*` });
      return;
    }

    await provider.delete({ key: keyPrefix });
  }

  static buildCacheKey ({ prefix, method, args }: BuildCacheKeyDto): string {
    const serializedArgs = args
      .map(arg => {
        if (arg && typeof arg === 'object' && 'user' in arg && arg.user && typeof arg.user === 'object' && 'userId' in arg.user) {
          return `user:${(arg.user as { userId: string }).userId}`;
        }

        if (arg === null || arg === undefined) {
          return String(arg);
        }

        if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
          return String(arg);
        }

        try {
          return JSON.stringify(arg);
        } catch {
          return `[${typeof arg}]`;
        }
      })
      .join(':');

    return `${prefix}:${method}:${serializedArgs}`;
  }
}
