import { REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { CacheKeyDto } from '../../src/modules/dtos/cache/cache-key.dto';
import { CacheKeysDto } from '../../src/modules/dtos/cache/cache-keys.dto';
import { CacheSetDto } from '../../src/modules/dtos/cache/cache-set.dto';
import { CacheSetIfNotExistsDto } from '../../src/modules/dtos/cache/cache-set-if-not-exists.dto';
import { SortedSetAddDto } from '../../src/modules/dtos/cache/sorted-set-add.dto';
import { SortedSetCountDto } from '../../src/modules/dtos/cache/sorted-set-count.dto';
import { SortedSetLatestDto } from '../../src/modules/dtos/cache/sorted-set-latest.dto';
import { SortedSetMemberDto } from '../../src/modules/dtos/cache/sorted-set-member.dto';
import { SortedSetRangeDto } from '../../src/modules/dtos/cache/sorted-set-range.dto';
import { RateLimitHitDto } from '../../src/modules/dtos/rate-limit/rate-limit-hit.dto';
import { RateLimitHitRecord } from '../../src/modules/interfaces/rate-limit-hit-record.interface';

export class MemoryCacheFake {
  readonly values = new Map<string, unknown>();
  readonly ttls = new Map<string, number>();
  readonly sets = new Map<string, Map<string, number>>();
  readonly hits = new Map<string, number>();

  get<T> ({ key }: CacheKeyDto): Promise<T | null> {
    return Promise.resolve((this.values.get(key) as T | undefined) ?? null);
  }

  set ({ key, value, ttlSeconds }: CacheSetDto): Promise<void> {
    this.values.set(key, value);
    if (ttlSeconds) this.ttls.set(key, ttlSeconds);
    return Promise.resolve();
  }

  delete ({ key }: CacheKeyDto): Promise<void> {
    this.values.delete(key);
    return Promise.resolve();
  }

  exists ({ key }: CacheKeyDto): Promise<boolean> {
    return Promise.resolve(this.values.has(key));
  }

  getMany<T> ({ keys }: CacheKeysDto): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>({ key })));
  }

  setIfNotExists ({ key, value }: CacheSetIfNotExistsDto): Promise<boolean> {
    if (this.values.has(key)) return Promise.resolve(false);
    this.values.set(key, value);
    return Promise.resolve(true);
  }

  hitRateLimit ({ key }: RateLimitHitDto): Promise<RateLimitHitRecord> {
    const totalHits = (this.hits.get(key) ?? 0) + 1;
    this.hits.set(key, totalHits);
    return Promise.resolve({ totalHits, timeToExpireMs: 0, timeToBlockExpireMs: 0 });
  }

  addToSortedSet ({ key, member, score }: SortedSetAddDto): Promise<void> {
    this.sets.set(key, (this.sets.get(key) ?? new Map<string, number>()).set(member, score));
    return Promise.resolve();
  }

  removeFromSortedSet ({ key, member }: SortedSetMemberDto): Promise<void> {
    this.sets.get(key)?.delete(member);
    return Promise.resolve();
  }

  latestInSortedSet ({ key, min, limit }: SortedSetLatestDto): Promise<string[]> {
    const entries = [...(this.sets.get(key) ?? new Map<string, number>())].filter(([, score]) => score >= min).sort((a, b) => b[1] - a[1]);
    return Promise.resolve(entries.slice(0, limit).map(([member]) => member));
  }

  countSortedSet ({ key, min }: SortedSetCountDto): Promise<number> {
    return Promise.resolve([...(this.sets.get(key)?.values() ?? [])].filter(score => score >= min).length);
  }

  rangeSortedSet ({ key, max = Infinity }: SortedSetRangeDto): Promise<string[]> {
    return Promise.resolve([...(this.sets.get(key) ?? new Map<string, number>())].filter(([, score]) => score <= max).map(([member]) => member));
  }

  trimSortedSet ({ key, max = Infinity }: SortedSetRangeDto): Promise<void> {
    const set = this.sets.get(key);
    [...(set ?? new Map<string, number>())].filter(([, score]) => score <= max).forEach(([member]) => set?.delete(member));
    return Promise.resolve();
  }
}

export const withCache = <T extends object>(target: T, cache: MemoryCacheFake): T => Object.assign(target, { [REDIS_CACHE_PROVIDER]: cache });
