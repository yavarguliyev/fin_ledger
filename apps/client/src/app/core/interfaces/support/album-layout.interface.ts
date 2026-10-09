import type { SupportMessage } from '../../types/support/support-message.type';

export interface AlbumLayout {
  firsts: Map<string, SupportMessage[]>;
  members: Set<string>;
}
