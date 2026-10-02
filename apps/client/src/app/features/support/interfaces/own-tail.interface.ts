import { SupportMessage } from '../../../core/types/support/support-message.type';

export interface OwnTailDto {
  messages: SupportMessage[];
  previousTail: string | null;
  myUserId: string | null;
}
