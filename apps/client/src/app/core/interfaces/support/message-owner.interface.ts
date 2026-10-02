import type { SupportMessage } from '../../types/support/support-message.type';

export interface MessageOwnerDto {
  message: SupportMessage;
  userId: string | null;
}
