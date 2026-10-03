import type { CallSignal } from './call-signal.interface';
import type { Reaction } from './reaction.interface';
import type { PresenceEntry } from '../../types/support/presence-entry.type';
import type { SupportMessage } from '../../types/support/support-message.type';

export interface SupportStreamEvent {
  type: string;
  conversationId?: string;
  message?: SupportMessage;
  readerUserId?: string;
  typingUserId?: string;
  messageId?: string;
  reactions?: Reaction[];
  presence?: PresenceEntry;
  call?: CallSignal;
}
