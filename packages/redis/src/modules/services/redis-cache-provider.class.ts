import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { errorResponse, ClientIds } from '@common/shared-libs';

import { CacheProvider } from '../interfaces/redis.interface';
import { RedisCacheConfig, RedisSentinelConfig } from '../interfaces/redis.interface';

export class RedisCacheProvider implements CacheProvider {
  private readonly client: Redis;
  private readonly logger: Logger;
  private readonly clientId: ClientIds;

  constructor (config: RedisCacheConfig) {
    this.clientId = config.clientId || ClientIds.DEAFULT;
    this.logger = new Logger(`${RedisCacheProvider.name}:${this.clientId}`);
    this.client = this.createClient(config);
    this.client.on('error', (err: Error) => this.logger.warn(`Redis connection error: ${errorResponse(err).message}`));
    this.logger.log(`Redis cache provider initialized for ${this.clientId}`);
  }

  async get<T> (key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (raw === null) return null;
    return this.deserialize<T>(raw);
  }

  async set<T> (key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = this.serialize(value);
    if (ttlSeconds !== undefined) await this.client.set(key, serialized, 'EX', ttlSeconds);
    else await this.client.set(key, serialized);
  }

  async invalidatePattern (pattern: string): Promise<void> {
    const keys = await this.scan(pattern);
    if (keys.length > 0) await this.client.del(keys);
  }

  async exists (key: string): Promise<boolean> {
    const count = await this.client.exists(key);
    return count === 1;
  }

  async delete (key: string): Promise<void> {
    await this.client.del(key);
  }

  async scan (pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [next, matchedKeys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = next;
      keys.push(...matchedKeys);
    } while (cursor !== '0');

    return keys;
  }

  async setIfNotExists<T> (key: string, value: T, ttlSeconds: number): Promise<boolean> {
    const serialized = this.serialize(value);
    const result = await this.client.set(key, serialized, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async disconnect (): Promise<void> {
    await this.client.quit();
  }

  private isSentinelConfig = (config: RedisCacheConfig): config is RedisSentinelConfig => 'sentinels' in config;
  private serialize = <T>(value: T): string => JSON.stringify(value);
  private deserialize = <T>(raw: string): T => JSON.parse(raw) as T;

  private createClient (config: RedisCacheConfig): Redis {
    if (this.isSentinelConfig(config)) {
      return new Redis({
        sentinels: [...config.sentinels],
        name: config.name ?? 'mymaster',
        ...(config.password != null && { password: config.password }),
        ...(config.db != null && { db: config.db })
      });
    }

    return new Redis({
      host: config.host,
      port: config.port,
      ...(config.password != null && { password: config.password }),
      ...(config.db != null && { db: config.db })
    });
  }
}
