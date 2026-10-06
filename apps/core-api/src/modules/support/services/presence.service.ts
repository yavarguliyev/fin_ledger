import { Injectable } from '@nestjs/common';
import {
  CacheClaim,
  CacheExists,
  CacheRead,
  CacheReadMany,
  CacheTake,
  CacheWrite,
  IndexAdd,
  IndexCount,
  IndexLatest,
  IndexRange,
  IndexRemove,
  IndexTrim
} from '@common/libs';

import { HeartbeatDto } from '../dtos/presence/heartbeat.dto';
import { PRESENCE } from '../constants/presence/presence.constant';
import { PresenceCutoffDto } from '../dtos/presence/presence-cutoff.dto';
import { PresenceHelper } from '../helpers/presence.helper';
import { PresenceScopeDto } from '../dtos/presence/presence-scope.dto';
import { StoredPresenceDto } from '../dtos/presence/stored-presence.dto';
import { UserIdsRefDto } from '../dtos/presence/user-ids-ref.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class PresenceService {
  @CacheRead({ key: (ref: UserRefDto) => PresenceHelper.lastSeenKeyFor(ref) })
  async lastSeen (_ref: UserRefDto): Promise<string | null> {
    return Promise.resolve(null);
  }

  @CacheExists({ key: (ref: UserRefDto) => PresenceHelper.keyFor(ref) })
  async isOnline (_ref: UserRefDto): Promise<boolean> {
    return Promise.resolve(false);
  }

  @IndexLatest({ index: (scope: PresenceScopeDto) => ({ key: PresenceHelper.indexFor(scope), min: PresenceHelper.onlineCutoff(), limit: PRESENCE.PAGE_SIZE }) })
  async onlineIds (_scope: PresenceScopeDto): Promise<string[]> {
    return Promise.resolve([]);
  }

  @IndexCount({ index: (scope: PresenceScopeDto) => ({ key: PresenceHelper.indexFor(scope), min: PresenceHelper.onlineCutoff() }) })
  async count (_scope: PresenceScopeDto): Promise<number> {
    return Promise.resolve(PRESENCE.NO_ENTRIES);
  }

  @CacheReadMany({ keys: ({ userIds }: UserIdsRefDto) => userIds.map(userId => PresenceHelper.keyFor({ userId })) })
  async entries (_ref: UserIdsRefDto): Promise<(StoredPresenceDto | null)[]> {
    return Promise.resolve([]);
  }

  @CacheReadMany({ keys: ({ userIds }: UserIdsRefDto) => userIds.map(userId => PresenceHelper.lastSeenKeyFor({ userId })) })
  async lastSeenMany (_ref: UserIdsRefDto): Promise<(string | null)[]> {
    return Promise.resolve([]);
  }

  @CacheWrite({ key: (dto: HeartbeatDto) => PresenceHelper.keyFor(dto), ttlSeconds: PRESENCE.ONLINE_TTL_SECONDS })
  @CacheWrite({
    key: (dto: HeartbeatDto) => PresenceHelper.lastSeenKeyFor(dto),
    ttlSeconds: PRESENCE.LAST_SEEN_TTL_SECONDS,
    value: (entry: StoredPresenceDto) => entry.lastSeenAt
  })
  @IndexAdd({ entries: (_dto: HeartbeatDto, entry: StoredPresenceDto) => PresenceHelper.indexEntries({ entry }) })
  async touch ({ userId, displayName, role }: HeartbeatDto): Promise<StoredPresenceDto> {
    return Promise.resolve({ userId, displayName, role, lastSeenAt: new Date().toISOString() });
  }

  @CacheTake({ key: (ref: UserRefDto) => PresenceHelper.keyFor(ref) })
  async takeEntry (_ref: UserRefDto): Promise<StoredPresenceDto | null> {
    return Promise.resolve(null);
  }

  @CacheWrite({ key: (ref: UserRefDto) => PresenceHelper.lastSeenKeyFor(ref), ttlSeconds: PRESENCE.LAST_SEEN_TTL_SECONDS })
  @IndexRemove({ members: (ref: UserRefDto) => PresenceHelper.indexMembers(ref) })
  async markLeft (_ref: UserRefDto): Promise<string> {
    return Promise.resolve(new Date().toISOString());
  }

  @CacheClaim({ key: PRESENCE.SWEEP_LOCK_KEY, value: PRESENCE.SWEEP_LOCK_VALUE, ttlSeconds: PRESENCE.SWEEP_LOCK_SECONDS })
  async claimSweep (): Promise<boolean> {
    return Promise.resolve(false);
  }

  @IndexRange({ range: ({ cutoff }: PresenceCutoffDto) => ({ key: PRESENCE.INDEX_KEY, max: cutoff }) })
  async staleIds (_dto: PresenceCutoffDto): Promise<string[]> {
    return Promise.resolve([]);
  }

  @IndexTrim({ ranges: (dto: PresenceCutoffDto) => PresenceHelper.staleRanges(dto) })
  async trimStale (_dto: PresenceCutoffDto): Promise<void> {
    return Promise.resolve();
  }
}
