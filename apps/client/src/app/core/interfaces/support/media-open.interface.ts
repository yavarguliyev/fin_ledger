import { SupportMessage } from '../../types/support/support-message.type';

export interface MediaOpenDto {
  items: SupportMessage[];
  messageId: string;
}
