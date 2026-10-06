import { PresenceState, SortedSetAddDto, SortedSetMemberDto, SortedSetRangeDto } from '@common/libs';

import { ContactPresenceDto } from '../dtos/contact/contact-presence.dto';
import { PRESENCE } from '../constants/presence/presence.constant';
import { PresenceCutoffDto } from '../dtos/presence/presence-cutoff.dto';
import { PresenceEntryDto } from '../dtos/presence/presence-entry.dto';
import { PresenceScopeDto } from '../dtos/presence/presence-scope.dto';
import { PresenceSnapshotDto } from '../dtos/presence/presence-snapshot.dto';
import { PresenceStatusDto } from '../dtos/presence/presence-status.dto';
import { StoredPresenceRefDto } from '../dtos/presence/stored-presence-ref.dto';
import { SupportAccessHelper } from './support-access.helper';
import { UserRefDto } from '../dtos/input/user-ref.dto';

export class PresenceHelper {
  static keyFor ({ userId }: UserRefDto): string {
    return `${PRESENCE.KEY_PREFIX}${userId}`;
  }

  static lastSeenKeyFor ({ userId }: UserRefDto): string {
    return `${PRESENCE.LAST_SEEN_PREFIX}${userId}`;
  }

  static indexFor ({ staffOnly }: PresenceScopeDto): string {
    return staffOnly ? PRESENCE.STAFF_INDEX_KEY : PRESENCE.INDEX_KEY;
  }

  static indexEntries ({ entry }: StoredPresenceRefDto): SortedSetAddDto[] {
    const score = Date.parse(entry.lastSeenAt);
    const staff = SupportAccessHelper.isStaff({ role: entry.role });
    return [PRESENCE.INDEX_KEY, ...(staff ? [PRESENCE.STAFF_INDEX_KEY] : [])].map(key => ({ key, member: entry.userId, score }));
  }

  static indexMembers ({ userId }: UserRefDto): SortedSetMemberDto[] {
    return [PRESENCE.INDEX_KEY, PRESENCE.STAFF_INDEX_KEY].map(key => ({ key, member: userId }));
  }

  static staleRanges ({ cutoff }: PresenceCutoffDto): SortedSetRangeDto[] {
    return [PRESENCE.INDEX_KEY, PRESENCE.STAFF_INDEX_KEY].map(key => ({ key, max: cutoff }));
  }

  static onlineCutoff (): number {
    return Date.now() - PRESENCE.ONLINE_TTL_SECONDS * PRESENCE.MS_PER_SECOND;
  }

  static statuses ({ userIds, online, lastSeen }: PresenceSnapshotDto): PresenceStatusDto[] {
    return userIds.map((userId, index) => ({ userId, online: !!online[index], lastSeenAt: lastSeen[index] ?? null }));
  }

  static offline ({ userId, lastSeenAt }: PresenceStatusDto): PresenceEntryDto {
    return { userId, displayName: PRESENCE.UNKNOWN, role: PRESENCE.UNKNOWN, state: PresenceState.OFFLINE, lastSeenAt };
  }

  static toEntry ({ entry }: StoredPresenceRefDto): PresenceEntryDto {
    return { ...entry, state: PresenceState.ONLINE };
  }

  static forContact ({ contact, online, lastSeenAt }: ContactPresenceDto): PresenceEntryDto {
    return { ...contact, state: online ? PresenceState.ONLINE : PresenceState.OFFLINE, lastSeenAt };
  }
}
