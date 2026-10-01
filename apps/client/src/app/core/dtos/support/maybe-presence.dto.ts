import type { PresenceEntry } from '../../types/support/presence-entry.type';

export interface MaybePresenceDto {
  presence: PresenceEntry | null;
}
