import { REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { CacheProvider } from '../interfaces/redis.interface';
import { GetCachedKey } from '../interfaces/redis.interface';
import { BuildCacheKeyParams, ResolveProviderParams, TryCacheResultParams, TryEvictCacheParams, TryGetCachedParams } from '../dtos/cache.dto';

export class CacheHelper {
  public static async tryCacheResult<T> ({ provider, key, value, ttl }: TryCacheResultParams<T>): Promise<void> {
    await provider.set(key, value, ttl);
  }

  public static resolveProvider ({ target }: ResolveProviderParams): CacheProvider | null {
    return (target[REDIS_CACHE_PROVIDER] as CacheProvider | undefined) ?? null;
  }

  public static async tryGetCached<T> ({ provider, cacheKey }: TryGetCachedParams): Promise<GetCachedKey<T>> {
    const cached = await provider.get<T>(cacheKey);
    if (cached !== null) return { hit: true, value: cached };
    return { hit: false, value: null };
  }

  public static async tryEvictCache ({ provider, keyPrefix, isPattern }: TryEvictCacheParams): Promise<void> {
    if (isPattern) {
      await provider.invalidatePattern(keyPrefix.endsWith('*') ? keyPrefix : `${keyPrefix}:*`);
      return;
    }

    await provider.delete(keyPrefix);
  }

  public static buildCacheKey ({ prefix, method, args }: BuildCacheKeyParams): string {
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
