import type { SupportMessage } from '../../types/support/support-message.type';

export interface MergeMessagesDto {
  current: SupportMessage[];
  incoming: SupportMessage;
}
