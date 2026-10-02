import { Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { HeartbeatDto } from '../dtos/presence/heartbeat.dto';
import { PRESENCE } from '../constants/presence/presence.constant';
import { PresenceEntryDto } from '../dtos/presence/presence-entry.dto';
import { PresenceHelper } from '../helpers/presence.helper';
import { SupportAccessHelper } from '../helpers/support-access.helper';
import { StoredPresenceDto } from '../dtos/presence/stored-presence.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';
import { PresenceScopeDto } from '../dtos/presence/presence-scope.dto';
import { UserIdsRefDto } from '../dtos/presence/user-ids-ref.dto';
import { PresenceStatusDto } from '../dtos/presence/presence-status.dto';

@Injectable()
export class PresenceRepository {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly cache: CacheProvider) {}

  async lastSeen ({ userId }: UserRefDto): Promise<string | null> {
    return this.cache.get<string>({ key: PresenceHelper.lastSeenKeyFor({ userId }) });
  }

  async isOnline ({ userId }: UserRefDto): Promise<boolean> {
    return this.cache.exists({ key: PresenceHelper.keyFor({ userId }) });
  }

  async list ({ staffOnly }: PresenceScopeDto): Promise<PresenceEntryDto[]> {
    const key = staffOnly ? PRESENCE.STAFF_INDEX_KEY : PRESENCE.INDEX_KEY;
    const userIds = await this.cache.latestInSortedSet({ key, min: PresenceHelper.onlineCutoff(), limit: PRESENCE.PAGE_SIZE });
    const stored = await this.cache.getMany<StoredPresenceDto>({ keys: userIds.map(userId => PresenceHelper.keyFor({ userId })) });
    return stored.filter((entry): entry is StoredPresenceDto => !!entry).map(entry => PresenceHelper.toEntry({ entry }));
  }

  async count ({ staffOnly }: PresenceScopeDto): Promise<number> {
    return this.cache.countSortedSet({ key: staffOnly ? PRESENCE.STAFF_INDEX_KEY : PRESENCE.INDEX_KEY, min: PresenceHelper.onlineCutoff() });
  }

  async statuses ({ userIds }: UserIdsRefDto): Promise<PresenceStatusDto[]> {
    const online = await this.cache.getMany<StoredPresenceDto>({ keys: userIds.map(userId => PresenceHelper.keyFor({ userId })) });
    const lastSeen = await this.cache.getMany<string>({ keys: userIds.map(userId => PresenceHelper.lastSeenKeyFor({ userId })) });
    return userIds.map((userId, index) => ({ userId, online: !!online[index], lastSeenAt: lastSeen[index] ?? null }));
  }

  async touch ({ userId, displayName, role }: HeartbeatDto): Promise<StoredPresenceDto> {
    const lastSeenAt = new Date().toISOString();
    const value: StoredPresenceDto = { userId, displayName, role, lastSeenAt };
    const score = Date.parse(lastSeenAt);

    await this.cache.set({ key: PresenceHelper.keyFor({ userId }), value, ttlSeconds: PRESENCE.ONLINE_TTL_SECONDS });
    await this.cache.addToSortedSet({ key: PRESENCE.INDEX_KEY, member: userId, score });
    if (SupportAccessHelper.isStaff({ role })) await this.cache.addToSortedSet({ key: PRESENCE.STAFF_INDEX_KEY, member: userId, score });
    await this.cache.set({ key: PresenceHelper.lastSeenKeyFor({ userId }), value: lastSeenAt, ttlSeconds: PRESENCE.LAST_SEEN_TTL_SECONDS });

    return value;
  }

  async leave ({ userId }: UserRefDto): Promise<StoredPresenceDto | null> {
    const stored = await this.cache.get<StoredPresenceDto>({ key: PresenceHelper.keyFor({ userId }) });
    const lastSeenAt = new Date().toISOString();

    await this.cache.set({ key: PresenceHelper.lastSeenKeyFor({ userId }), value: lastSeenAt, ttlSeconds: PRESENCE.LAST_SEEN_TTL_SECONDS });
    await this.cache.delete({ key: PresenceHelper.keyFor({ userId }) });
    await this.cache.removeFromSortedSet({ key: PRESENCE.INDEX_KEY, member: userId });
    await this.cache.removeFromSortedSet({ key: PRESENCE.STAFF_INDEX_KEY, member: userId });

    return stored ? { ...stored, lastSeenAt } : null;
  }

  async claimSweep (): Promise<boolean> {
    return this.cache.setIfNotExists({ key: PRESENCE.SWEEP_LOCK_KEY, value: PRESENCE.SWEEP_LOCK_VALUE, ttlSeconds: PRESENCE.SWEEP_LOCK_SECONDS });
  }

  async expire (): Promise<PresenceStatusDto[]> {
    const cutoff = PresenceHelper.onlineCutoff();
    const stale = await this.cache.rangeSortedSet({ key: PRESENCE.INDEX_KEY, max: cutoff });
    if (stale.length === 0) return [];

    await this.cache.trimSortedSet({ key: PRESENCE.INDEX_KEY, max: cutoff });
    await this.cache.trimSortedSet({ key: PRESENCE.STAFF_INDEX_KEY, max: cutoff });

    return (await this.statuses({ userIds: stale })).filter(status => !status.online);
  }
}
