import { InjectionToken } from '@nestjs/common';
import { CacheKey, CacheTTL, ClientIds } from '@common/shared-libs';

export interface RedisCacheConfig {
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly db?: number;
  readonly clientId?: ClientIds;
}

export interface RedisSentinelConfig extends RedisCacheConfig {
  readonly name?: string;
  readonly sentinels: ReadonlyArray<{ readonly host: string; readonly port: number }>;
}

export interface CacheableOptions {
  readonly keyPrefix: CacheKey;
  readonly ttlSeconds?: CacheTTL;
}

export interface CacheEvictOptions {
  readonly keyPrefix: CacheKey[];
  readonly targetMethodName?: string;
  readonly isPattern?: boolean;
}

export interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt?: number;
}

export interface GetCachedKey<T> {
  readonly hit: boolean;
  readonly value: T | null;
}

export interface RedisModuleAsyncOptions {
  readonly useFactory: (...args: unknown[]) => RedisCacheConfig | Promise<RedisCacheConfig>;
  readonly inject?: InjectionToken[];
  readonly clientId?: ClientIds;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  exists(key: string): Promise<boolean> | boolean;
  invalidatePattern(pattern: string): Promise<void> | void;
  scan(pattern: string): Promise<string[]>;
  disconnect(): Promise<void> | void;
}
