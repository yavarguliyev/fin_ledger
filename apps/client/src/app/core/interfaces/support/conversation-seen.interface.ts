import { SupportConversation } from '../../types/support/support-conversation.type';

export interface ConversationSeenDto {
  current: SupportConversation[];
  conversationId: string;
  myUserId: string;
}
