import { MaybePresenceDto } from '../../dtos/support/maybe-presence.dto';
import { MergePresenceDto } from '../../dtos/support/merge-presence.dto';
import { PresenceEntry } from '../../types/support/presence-entry.type';
import { SUPPORT } from '../../constants/support/support.constant';

export class PresenceHelper {
  static isOnline ({ presence }: MaybePresenceDto): boolean {
    return presence?.state === SUPPORT.ONLINE_STATE;
  }

  static replace ({ current, presence }: MergePresenceDto): PresenceEntry[] {
    return current.map(entry => (entry.userId === presence.userId ? { ...entry, ...presence } : entry));
  }

  static upsertOnline ({ current, presence }: MergePresenceDto): PresenceEntry[] {
    const others = current.filter(entry => entry.userId !== presence.userId);
    return presence.state === SUPPORT.ONLINE_STATE ? [...others, presence] : others;
  }
}
