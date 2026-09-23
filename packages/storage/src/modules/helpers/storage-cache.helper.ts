import { STORAGE_CACHE } from '../constants/cache/storage-cache.constant';

export class StorageCacheHelper {
  static scopeOf (this: void, args: unknown[]): string {
    const [first] = args;

    if (first && typeof first === 'object' && 'key' in first && typeof first.key === 'string') return first.key;

    return STORAGE_CACHE.UNSCOPED;
  }
}
