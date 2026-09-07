import { CacheProvider } from '../interfaces/redis.interface';
import { CacheEntry } from '../interfaces/redis.interface';

export class InMemoryCacheProvider implements CacheProvider {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  async get<T> (key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return Promise.resolve(entry.value as T);
  }

  set<T> (key: string, value: T, ttlSeconds?: number): void {
    const entry: CacheEntry<T> = ttlSeconds !== undefined ? { value, expiresAt: Date.now() + ttlSeconds * 1000 } : { value };
    this.store.set(key, entry);
  }

  invalidatePattern (pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
  }

  exists (): boolean {
    return false;
  }

  delete (key: string): void {
    this.store.delete(key);
  }

  scan (pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Promise.resolve(Array.from(this.store.keys()).filter(key => regex.test(key)));
  }

  disconnect (): void {
    this.store.clear();
  }
}
