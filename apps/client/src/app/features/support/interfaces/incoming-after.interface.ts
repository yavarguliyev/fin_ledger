import { SupportMessage } from '../../../core/types/support/support-message.type';

export interface IncomingAfterDto {
  messages: SupportMessage[];
  afterId: string | null;
  myUserId: string | null;
}
