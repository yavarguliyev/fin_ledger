import Redis from 'ioredis';

import { CACHE_RESET as C } from '../constants/cache-reset.constant';
import { CacheResetDto } from '../interfaces/cache-reset.interface';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

export class CacheResetHelper {
  static async clear ({ pattern }: CacheResetDto): Promise<void> {
    const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);
    let cursor: string = C.START_CURSOR;

    do {
      const [next, keys] = await redis.scan(cursor, C.MATCH, pattern, C.COUNT, C.SCAN_COUNT);
      if (keys.length) await redis.del(...keys);
      cursor = next;
    } while (cursor !== C.START_CURSOR);

    await redis.quit();
  }
}
