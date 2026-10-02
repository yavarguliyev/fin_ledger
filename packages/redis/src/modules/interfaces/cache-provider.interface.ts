import type { CacheKeyDto } from '../dtos/cache/cache-key.dto';
import type { CachePatternDto } from '../dtos/cache/cache-pattern.dto';
import type { CacheSetDto } from '../dtos/cache/cache-set.dto';
import type { CacheKeysDto } from '../dtos/cache/cache-keys.dto';
import type { SortedSetAddDto } from '../dtos/cache/sorted-set-add.dto';
import type { SortedSetMemberDto } from '../dtos/cache/sorted-set-member.dto';
import type { SortedSetRangeDto } from '../dtos/cache/sorted-set-range.dto';
import type { SortedSetLatestDto } from '../dtos/cache/sorted-set-latest.dto';
import type { SortedSetCountDto } from '../dtos/cache/sorted-set-count.dto';
import type { CacheSetIfNotExistsDto } from '../dtos/cache/cache-set-if-not-exists.dto';

export interface CacheProvider {
  get<T>(dto: CacheKeyDto): Promise<T | null>;
  set(dto: CacheSetDto): Promise<void> | void;
  delete(dto: CacheKeyDto): Promise<void> | void;
  exists(dto: CacheKeyDto): Promise<boolean> | boolean;
  invalidatePattern(dto: CachePatternDto): Promise<void> | void;
  scan(dto: CachePatternDto): Promise<string[]>;
  getMany<T>(dto: CacheKeysDto): Promise<(T | null)[]>;
  addToSortedSet(dto: SortedSetAddDto): Promise<void>;
  removeFromSortedSet(dto: SortedSetMemberDto): Promise<void>;
  rangeSortedSet(dto: SortedSetRangeDto): Promise<string[]>;
  trimSortedSet(dto: SortedSetRangeDto): Promise<void>;
  latestInSortedSet(dto: SortedSetLatestDto): Promise<string[]>;
  countSortedSet(dto: SortedSetCountDto): Promise<number>;
  setIfNotExists(dto: CacheSetIfNotExistsDto): Promise<boolean>;
  disconnect(): Promise<void> | void;
}
