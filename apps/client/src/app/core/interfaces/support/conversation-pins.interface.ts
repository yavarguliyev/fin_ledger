import { SupportMessage } from '../../types/support/support-message.type';

export interface ConversationPinsDto {
  conversationId: string;
  pins: SupportMessage[];
}
