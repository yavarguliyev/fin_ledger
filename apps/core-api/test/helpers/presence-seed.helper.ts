import { PRESENCE_SEED as P } from '../constants/presence-seed.constant';
import { PresenceClearDto, PresenceSeedDto } from '../interfaces/presence-seed.interface';

export class PresenceSeedHelper {
  static async seed ({ redis, userIds, displayName }: PresenceSeedDto): Promise<void> {
    const lastSeenAt = new Date().toISOString();
    const pipeline = redis.pipeline();

    for (const userId of userIds) {
      pipeline.set(`${P.KEY_PREFIX}${userId}`, JSON.stringify({ userId, displayName, role: P.ROLE, lastSeenAt }), P.EXPIRE_FLAG, P.TTL_SECONDS);
      pipeline.zadd(P.INDEX_KEY, Date.now(), userId);
    }

    await pipeline.exec();
  }

  static async clear ({ redis, userIds }: PresenceClearDto): Promise<void> {
    await redis.del(...userIds.map(userId => `${P.KEY_PREFIX}${userId}`));
    await redis.zrem(P.INDEX_KEY, ...userIds);
    await redis.quit();
  }
}
