import { REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { CacheProvider } from '../interfaces/redis.interface';
import { GetCachedKey } from '../interfaces/redis.interface';

export const buildCacheKey = (prefix: string, method: string, args: unknown[]): string => {
  const serializedArgs = args
    .map(arg => {
      if (arg && typeof arg === 'object' && 'user' in arg && arg.user && typeof arg.user === 'object' && 'userId' in arg.user) {
        return `user:${(arg.user as { userId: string }).userId}`;
      }

      if (arg === null || arg === undefined) return String(arg);
      if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') return String(arg);

      try {
        return JSON.stringify(arg);
      } catch {
        return `[${typeof arg}]`;
      }
    })
    .join(':');

  return `${prefix}:${method}:${serializedArgs}`;
};

export const tryGetCached = async <T>(provider: CacheProvider, cacheKey: string): Promise<GetCachedKey<T>> => {
  const cached = await provider.get<T>(cacheKey);
  if (cached !== null) return { hit: true, value: cached };
  return { hit: false, value: null };
};

export const tryCacheResult = async <T>(provider: CacheProvider, key: string, value: T, ttl?: number): Promise<void> => {
  await provider.set(key, value, ttl);
};

export const tryEvictCache = async (provider: CacheProvider, keyPrefix: string, isPattern: boolean): Promise<void> => {
  if (isPattern) await provider.invalidatePattern(keyPrefix.endsWith('*') ? keyPrefix : `${keyPrefix}:*`);
  else await provider.delete(keyPrefix);
};

export const resolveProvider = (target: Record<string | symbol, unknown>): CacheProvider | null => {
  return (target[REDIS_CACHE_PROVIDER] as CacheProvider | undefined) ?? null;
};
