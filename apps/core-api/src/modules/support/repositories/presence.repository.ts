import { Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { HeartbeatDto } from '../dtos/presence/heartbeat.dto';
import { PRESENCE } from '../constants/presence/presence.constant';
import { PresenceEntryDto } from '../dtos/presence/presence-entry.dto';
import { PresenceHelper } from '../helpers/presence.helper';
import { StoredPresenceDto } from '../dtos/presence/stored-presence.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class PresenceRepository {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly cache: CacheProvider) {}

  async lastSeen ({ userId }: UserRefDto): Promise<string | null> {
    return this.cache.get<string>({ key: PresenceHelper.lastSeenKeyFor({ userId }) });
  }

  async isOnline ({ userId }: UserRefDto): Promise<boolean> {
    return this.cache.exists({ key: PresenceHelper.keyFor({ userId }) });
  }

  async list (): Promise<PresenceEntryDto[]> {
    const cutoff = Date.now() - PRESENCE.ONLINE_TTL_SECONDS * PRESENCE.MS_PER_SECOND;
    await this.cache.trimSortedSet({ key: PRESENCE.INDEX_KEY, max: cutoff });

    const userIds = await this.cache.rangeSortedSet({ key: PRESENCE.INDEX_KEY, min: cutoff });
    const stored = await this.cache.getMany<StoredPresenceDto>({ keys: userIds.map(userId => PresenceHelper.keyFor({ userId })) });
    return stored.filter((entry): entry is StoredPresenceDto => !!entry).map(entry => PresenceHelper.toEntry({ entry }));
  }

  async touch ({ userId, displayName, role }: HeartbeatDto): Promise<StoredPresenceDto> {
    const lastSeenAt = new Date().toISOString();
    const value: StoredPresenceDto = { userId, displayName, role, lastSeenAt };

    await this.cache.set({ key: PresenceHelper.keyFor({ userId }), value, ttlSeconds: PRESENCE.ONLINE_TTL_SECONDS });
    await this.cache.addToSortedSet({ key: PRESENCE.INDEX_KEY, member: userId, score: Date.parse(lastSeenAt) });
    await this.cache.set({ key: PresenceHelper.lastSeenKeyFor({ userId }), value: lastSeenAt, ttlSeconds: PRESENCE.LAST_SEEN_TTL_SECONDS });

    return value;
  }

  async leave ({ userId }: UserRefDto): Promise<StoredPresenceDto | null> {
    const stored = await this.cache.get<StoredPresenceDto>({ key: PresenceHelper.keyFor({ userId }) });
    const lastSeenAt = new Date().toISOString();

    await this.cache.set({ key: PresenceHelper.lastSeenKeyFor({ userId }), value: lastSeenAt, ttlSeconds: PRESENCE.LAST_SEEN_TTL_SECONDS });
    await this.cache.delete({ key: PresenceHelper.keyFor({ userId }) });
    await this.cache.removeFromSortedSet({ key: PRESENCE.INDEX_KEY, member: userId });

    return stored ? { ...stored, lastSeenAt } : null;
  }
}
