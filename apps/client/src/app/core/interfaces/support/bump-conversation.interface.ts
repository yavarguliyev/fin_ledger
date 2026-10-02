import type { SupportConversation } from '../../types/support/support-conversation.type';
import type { SupportMessage } from '../../types/support/support-message.type';

export interface BumpConversationDto {
  current: SupportConversation[];
  message: SupportMessage;
  myUserId: string;
  activeId: string | null;
}
