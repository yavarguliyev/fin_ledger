import type { CacheKeyDto } from '../dtos/cache/cache-key.dto';
import type { CachePatternDto } from '../dtos/cache/cache-pattern.dto';
import type { CacheSetDto } from '../dtos/cache/cache-set.dto';

export interface CacheProvider {
  get<T>(dto: CacheKeyDto): Promise<T | null>;
  set(dto: CacheSetDto): Promise<void> | void;
  delete(dto: CacheKeyDto): Promise<void> | void;
  exists(dto: CacheKeyDto): Promise<boolean> | boolean;
  invalidatePattern(dto: CachePatternDto): Promise<void> | void;
  scan(dto: CachePatternDto): Promise<string[]>;
  disconnect(): Promise<void> | void;
}
