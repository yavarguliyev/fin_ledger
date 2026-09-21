import { CacheProvider } from '../interfaces/cache-provider.interface';
import { CacheEntry } from '../interfaces/cache-entry.interface';
import { CacheKeyDto } from '../dtos/cache/cache-key.dto';
import { CachePatternDto } from '../dtos/cache/cache-pattern.dto';
import { CacheSetDto } from '../dtos/cache/cache-set.dto';

export class InMemoryCacheProvider implements CacheProvider {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  async get<T> ({ key }: CacheKeyDto): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return Promise.resolve(entry.value as T);
  }

  set ({ key, value, ttlSeconds }: CacheSetDto): void {
    const entry: CacheEntry<unknown> = ttlSeconds !== undefined ? { value, expiresAt: Date.now() + ttlSeconds * 1000 } : { value };
    this.store.set(key, entry);
  }

  invalidatePattern ({ pattern }: CachePatternDto): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
  }

  exists (): boolean {
    return false;
  }

  delete ({ key }: CacheKeyDto): void {
    this.store.delete(key);
  }

  scan ({ pattern }: CachePatternDto): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Promise.resolve(Array.from(this.store.keys()).filter(key => regex.test(key)));
  }

  disconnect (): void {
    this.store.clear();
  }
}
