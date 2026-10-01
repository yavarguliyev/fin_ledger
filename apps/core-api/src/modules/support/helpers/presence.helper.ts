import { PresenceState } from '@common/libs';

import { ContactPresenceDto } from '../dtos/contact/contact-presence.dto';
import { PRESENCE } from '../constants/presence/presence.constant';
import { PresenceEntryDto } from '../dtos/presence/presence-entry.dto';
import { StoredPresenceRefDto } from '../dtos/presence/stored-presence-ref.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';

export class PresenceHelper {
  static keyFor ({ userId }: UserRefDto): string {
    return `${PRESENCE.KEY_PREFIX}${userId}`;
  }

  static lastSeenKeyFor ({ userId }: UserRefDto): string {
    return `${PRESENCE.LAST_SEEN_PREFIX}${userId}`;
  }

  static toEntry ({ entry }: StoredPresenceRefDto): PresenceEntryDto {
    return { ...entry, state: PresenceState.ONLINE };
  }

  static forContact ({ contact, online, lastSeenAt }: ContactPresenceDto): PresenceEntryDto {
    return { ...contact, state: online ? PresenceState.ONLINE : PresenceState.OFFLINE, lastSeenAt };
  }
}
