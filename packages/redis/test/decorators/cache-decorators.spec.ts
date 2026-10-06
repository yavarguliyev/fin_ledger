import { CacheClaim } from '../../src/modules/decorators/cache-claim.decorator';
import { CacheDelete } from '../../src/modules/decorators/cache-delete.decorator';
import { CacheExists } from '../../src/modules/decorators/cache-exists.decorator';
import { CacheRead } from '../../src/modules/decorators/cache-read.decorator';
import { CacheReadMany } from '../../src/modules/decorators/cache-read-many.decorator';
import { CacheTake } from '../../src/modules/decorators/cache-take.decorator';
import { CacheWrite } from '../../src/modules/decorators/cache-write.decorator';
import { CacheHelper } from '../../src/modules/helpers/cache.helper';
import { DECORATORS_TEST as T } from '../constants/decorators.constant';
import { ItemRef, ItemsRef } from '../interfaces/decorators.interface';
import { MemoryCacheFake, withCache } from '../fakes/memory-cache.fake';

const keyOf = ({ id }: ItemRef): string => `${T.PREFIX}${id}`;

class Items {
  @CacheRead({ key: keyOf })
  async read (_ref: ItemRef): Promise<string | null> {
    return Promise.resolve(T.FALLBACK);
  }

  @CacheExists({ key: keyOf })
  async has (_ref: ItemRef): Promise<boolean> {
    return Promise.resolve(false);
  }

  @CacheTake({ key: keyOf })
  async take (_ref: ItemRef): Promise<string | null> {
    return Promise.resolve(null);
  }

  @CacheWrite({ key: keyOf, ttlSeconds: T.TTL })
  async write (_ref: ItemRef): Promise<string> {
    return Promise.resolve(T.VALUE);
  }

  @CacheDelete({ keys: (ref: ItemRef) => [keyOf(ref)] })
  async remove (_ref: ItemRef): Promise<void> {
    return Promise.resolve();
  }

  @CacheReadMany({ keys: ({ ids }: ItemsRef) => ids.map(id => keyOf({ id })) })
  async readMany (_ref: ItemsRef): Promise<(string | null)[]> {
    return Promise.resolve([]);
  }

  @CacheClaim({ key: T.LOCK_KEY, value: T.LOCK_VALUE, ttlSeconds: T.TTL })
  async claim (): Promise<boolean> {
    return Promise.resolve(false);
  }
}

describe('Cache decorators', () => {
  let cache: MemoryCacheFake;
  let items: Items;

  beforeEach(() => {
    cache = new MemoryCacheFake();
    items = withCache(new Items(), cache);
  });

  it('writes the result with its TTL, then reads it, checks it and reads many', async () => {
    await items.write({ id: T.ID });

    expect(cache.ttls.get(T.KEY)).toBe(T.TTL);
    expect(await items.read({ id: T.ID })).toBe(T.VALUE);
    expect(await items.has({ id: T.ID })).toBe(true);
    expect(await items.readMany({ ids: [T.ID, T.OTHER] })).toEqual([T.VALUE, null]);
  });

  it('falls back to the method body on a miss and when no provider is attached', async () => {
    expect(await items.read({ id: T.OTHER })).toBe(T.FALLBACK);
    expect(await new Items().read({ id: T.ID })).toBe(T.FALLBACK);
  });

  it('takes a value once and deletes on demand', async () => {
    await items.write({ id: T.ID });

    expect(await items.take({ id: T.ID })).toBe(T.VALUE);
    expect(await items.take({ id: T.ID })).toBeNull();

    await items.write({ id: T.ID });
    await items.remove({ id: T.ID });
    expect(await items.has({ id: T.ID })).toBe(false);
  });

  it('uses the provider registered by the Redis module when the service holds none', async () => {
    CacheHelper.register({ provider: cache as never });
    const plain = new Items();
    await plain.write({ id: T.ID });

    expect(await plain.read({ id: T.ID })).toBe(T.VALUE);
    CacheHelper.register({ provider: null as never });
  });

  it('claims a lock only once', async () => {
    expect(await items.claim()).toBe(true);
    expect(await items.claim()).toBe(false);
  });
});
