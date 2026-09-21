import { RedisCacheConfig } from './redis-cache-config.interface';

export interface RedisSentinelConfig extends RedisCacheConfig {
  readonly name?: string;
  readonly sentinels: ReadonlyArray<{ readonly host: string; readonly port: number }>;
}
