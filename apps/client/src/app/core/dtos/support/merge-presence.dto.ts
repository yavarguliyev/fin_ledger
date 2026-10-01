import type { PresenceEntry } from '../../types/support/presence-entry.type';

export interface MergePresenceDto {
  current: PresenceEntry[];
  presence: PresenceEntry;
}
