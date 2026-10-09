import { ChatFilter } from '../../types/support/chat-filter.type';
import { SupportConversation } from '../../types/support/support-conversation.type';

export interface ConversationFilterDto {
  conversation: SupportConversation | null;
  filter: ChatFilter;
}
