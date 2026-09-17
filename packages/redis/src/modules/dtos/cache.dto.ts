import { CacheProvider } from '../interfaces/redis.interface';

export type ResolveProviderParams = { target: Record<string | symbol, unknown> };

export type BuildCacheKeyParams = {
  prefix: string;
  method: string;
  args: unknown[];
};

export type TryGetCachedParams = {
  provider: CacheProvider;
  cacheKey: string;
};

export type TryCacheResultParams<T> = {
  provider: CacheProvider;
  key: string;
  value: T;
  ttl?: number | undefined;
};

export type TryEvictCacheParams = {
  provider: CacheProvider;
  keyPrefix: string;
  isPattern: boolean;
};
