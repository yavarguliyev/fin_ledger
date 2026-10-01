import type { SupportConversation } from '../../types/support/support-conversation.type';

export interface UpsertConversationDto {
  current: SupportConversation[];
  incoming: SupportConversation;
}
