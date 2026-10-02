import { MaybePresenceDto } from '../../interfaces/support/maybe-presence.interface';
import { MergePresenceDto } from '../../interfaces/support/merge-presence.interface';
import { PresenceEntry } from '../../types/support/presence-entry.type';
import { SUPPORT } from '../../constants/support/support.constant';

export class PresenceHelper {
  static isOnline ({ presence }: MaybePresenceDto): boolean {
    return presence?.state === SUPPORT.ONLINE_STATE;
  }

  static replace ({ current, presence }: MergePresenceDto): PresenceEntry[] {
    return current.map(entry =>
      entry.userId === presence.userId
        ? { ...entry, ...presence, displayName: presence.displayName || entry.displayName, role: presence.role || entry.role }
        : entry
    );
  }

  static upsertOnline ({ current, presence }: MergePresenceDto): PresenceEntry[] {
    const others = current.filter(entry => entry.userId !== presence.userId);
    return presence.state === SUPPORT.ONLINE_STATE ? [...others, presence] : others;
  }
}
