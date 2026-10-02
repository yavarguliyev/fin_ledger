import { SupportMessage } from '../../../core/types/support/support-message.type';

export interface MarkerAfterOpenDto {
  messages: SupportMessage[];
  unread: number;
}
