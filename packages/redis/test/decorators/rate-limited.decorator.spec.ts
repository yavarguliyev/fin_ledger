import { RateLimited } from '../../src/modules/decorators/rate-limited.decorator';
import { DECORATORS_TEST as T } from '../constants/decorators.constant';
import { MemoryCacheFake, withCache } from '../fakes/memory-cache.fake';

class Lookup {
  @RateLimited({ key: T.LOCK_KEY, limit: 1, windowMs: T.TTL, error: () => new Error(T.FALLBACK) })
  async find (): Promise<string> {
    return Promise.resolve(T.VALUE);
  }
}

describe('RateLimited', () => {
  it('lets the first call through and refuses the next one in the window', async () => {
    const lookup = withCache(new Lookup(), new MemoryCacheFake());

    expect(await lookup.find()).toBe(T.VALUE);
    await expect(lookup.find()).rejects.toThrow(T.FALLBACK);
  });
});
