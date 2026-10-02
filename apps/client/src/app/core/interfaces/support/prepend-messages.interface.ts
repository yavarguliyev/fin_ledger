import type { SupportMessage } from '../../types/support/support-message.type';

export interface PrependMessagesDto {
  conversationId: string;
  messages: SupportMessage[];
}
