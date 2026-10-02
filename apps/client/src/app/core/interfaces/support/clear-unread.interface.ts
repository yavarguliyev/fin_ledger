import type { SupportConversation } from '../../types/support/support-conversation.type';

export interface ClearUnreadDto {
  current: SupportConversation[];
  conversationId: string;
}
