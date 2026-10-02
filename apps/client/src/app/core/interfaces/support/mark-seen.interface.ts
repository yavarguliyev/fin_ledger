import type { SupportMessage } from '../../types/support/support-message.type';

export interface MarkSeenDto {
  current: SupportMessage[];
  readerUserId: string;
}
