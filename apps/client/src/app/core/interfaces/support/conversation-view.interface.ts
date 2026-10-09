import { SupportConversation } from '../../types/support/support-conversation.type';

export interface ConversationViewDto {
  conversation: SupportConversation;
  myUserId: string;
}
