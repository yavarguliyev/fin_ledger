import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { ClientIds, BaseHelper } from '@common/shared-libs';

import { CacheProvider } from '../interfaces/cache-provider.interface';
import { RedisConfigRefDto } from '../dtos/provider/redis-config-ref.dto';
import { SerializeDto } from '../dtos/provider/serialize.dto';
import { DeserializeDto } from '../dtos/provider/deserialize.dto';
import { CacheKeyDto } from '../dtos/cache/cache-key.dto';
import { CachePatternDto } from '../dtos/cache/cache-pattern.dto';
import { CacheSetDto } from '../dtos/cache/cache-set.dto';
import { CacheSetIfNotExistsDto } from '../dtos/cache/cache-set-if-not-exists.dto';
import { RateLimitHitDto } from '../dtos/rate-limit/rate-limit-hit.dto';
import { RateLimitHitRecord } from '../interfaces/rate-limit-hit-record.interface';
import { RATE_LIMIT_SCRIPT } from '../constants/rate-limit/rate-limit-script.constant';
import { RATE_LIMIT_KEYS } from '../constants/rate-limit/rate-limit-keys.constant';
import { REDIS_DEFAULTS } from '../constants/connection/redis-defaults.constant';
import { RedisClientHelper } from '../helpers/redis-client.helper';
import { CacheKeysDto } from '../dtos/cache/cache-keys.dto';
import { SortedSetAddDto } from '../dtos/cache/sorted-set-add.dto';
import { SortedSetMemberDto } from '../dtos/cache/sorted-set-member.dto';
import { SortedSetRangeDto } from '../dtos/cache/sorted-set-range.dto';

export class RedisCacheProvider implements CacheProvider {
  private readonly client: Redis;
  private readonly logger: Logger;
  private readonly clientId: ClientIds;

  constructor ({ config }: RedisConfigRefDto) {
    this.clientId = config.clientId || ClientIds.DEFAULT;
    this.logger = new Logger(`${RedisCacheProvider.name}:${this.clientId}`);
    this.client = RedisClientHelper.create({ config });
    this.client.on('error', (error: Error) => this.logger.warn(`Redis connection error: ${BaseHelper.errorResponse({ error }).message}`));
    this.logger.log(`Redis cache provider initialized for ${this.clientId}`);
  }

  async get<T> ({ key }: CacheKeyDto): Promise<T | null> {
    const raw = await this.client.get(key);
    if (raw === null) return null;
    return this.deserialize<T>({ raw });
  }

  async set ({ key, value, ttlSeconds }: CacheSetDto): Promise<void> {
    const serialized = this.serialize({ value });
    if (ttlSeconds !== undefined) await this.client.set(key, serialized, 'EX', ttlSeconds);
    else await this.client.set(key, serialized);
  }

  async invalidatePattern (dto: CachePatternDto): Promise<void> {
    const keys = await this.scan(dto);
    if (keys.length > 0) await this.client.del(keys);
  }

  async exists ({ key }: CacheKeyDto): Promise<boolean> {
    const count = await this.client.exists(key);
    return count === 1;
  }

  async delete ({ key }: CacheKeyDto): Promise<void> {
    await this.client.del(key);
  }

  async scan ({ pattern }: CachePatternDto): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [next, matchedKeys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', REDIS_DEFAULTS.SCAN_BATCH_SIZE);
      cursor = next;
      keys.push(...matchedKeys);
    } while (cursor !== '0');

    return keys;
  }

  async setIfNotExists ({ key, value, ttlSeconds }: CacheSetIfNotExistsDto): Promise<boolean> {
    const serialized = this.serialize({ value });
    const result = await this.client.set(key, serialized, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async hitRateLimit ({ key, ttlMs, limit, blockDurationMs }: RateLimitHitDto): Promise<RateLimitHitRecord> {
    const [totalHits, timeToExpireMs, timeToBlockExpireMs] = (await this.client.eval(
      RATE_LIMIT_SCRIPT,
      2,
      key,
      `${key}${RATE_LIMIT_KEYS.BLOCKED_SUFFIX}`,
      ttlMs,
      limit,
      blockDurationMs
    )) as [number, number, number];

    return { totalHits, timeToExpireMs, timeToBlockExpireMs };
  }

  async getMany<T> ({ keys }: CacheKeysDto): Promise<(T | null)[]> {
    if (keys.length === 0) return [];
    const raws = await this.client.mget(...keys);
    return raws.map(raw => (raw === null ? null : this.deserialize<T>({ raw })));
  }

  async addToSortedSet ({ key, member, score }: SortedSetAddDto): Promise<void> {
    await this.client.zadd(key, score, member);
  }

  async removeFromSortedSet ({ key, member }: SortedSetMemberDto): Promise<void> {
    await this.client.zrem(key, member);
  }

  async rangeSortedSet ({ key, min, max }: SortedSetRangeDto): Promise<string[]> {
    return this.client.zrangebyscore(key, min ?? REDIS_DEFAULTS.MIN_SCORE, max ?? REDIS_DEFAULTS.MAX_SCORE);
  }

  async trimSortedSet ({ key, min, max }: SortedSetRangeDto): Promise<void> {
    await this.client.zremrangebyscore(key, min ?? REDIS_DEFAULTS.MIN_SCORE, max ?? REDIS_DEFAULTS.MAX_SCORE);
  }

  async disconnect (): Promise<void> {
    await this.client.quit();
  }

  private serialize = ({ value }: SerializeDto): string => JSON.stringify(value);
  private deserialize = <T>({ raw }: DeserializeDto): T => JSON.parse(raw) as T;
}
