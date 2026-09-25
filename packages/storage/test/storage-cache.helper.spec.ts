import { CacheHelper } from '@common/redis';

import { StorageCacheHelper } from '../src/modules/helpers/storage-cache.helper';
import { STORAGE_CACHE } from '../src/modules/constants/cache/storage-cache.constant';

const PREFIX = 'storage:file-urls';
const OWNER = 'users/alice/profile';
const OTHER = 'users/bob/profile';

describe('StorageCacheHelper', () => {
  it('scopes a cache key by the storage key the call touches', () => {
    expect(StorageCacheHelper.scopeOf([{ key: OWNER }])).toBe(OWNER);
  });

  it('falls back to an unscoped segment when the call carries no key', () => {
    expect(StorageCacheHelper.scopeOf([{ indexes: [1] }])).toBe(STORAGE_CACHE.UNSCOPED);
    expect(StorageCacheHelper.scopeOf([])).toBe(STORAGE_CACHE.UNSCOPED);
  });

  it("builds keys that one owner's eviction pattern matches and another owner's does not", () => {
    const ownerKey = CacheHelper.buildCacheKey({ prefix: PREFIX, method: 'get', args: [{ key: OWNER }], scope: OWNER });
    const otherKey = CacheHelper.buildCacheKey({ prefix: PREFIX, method: 'get', args: [{ key: OTHER }], scope: OTHER });

    const evictionPattern = `${PREFIX}:${OWNER}:`;

    expect(ownerKey.startsWith(evictionPattern)).toBe(true);
    expect(otherKey.startsWith(evictionPattern)).toBe(false);
  });
});
