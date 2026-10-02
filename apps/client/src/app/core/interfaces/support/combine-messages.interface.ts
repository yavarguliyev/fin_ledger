import type { SupportMessage } from '../../types/support/support-message.type';

export interface CombineMessagesDto {
  current: SupportMessage[];
  page: SupportMessage[];
}
