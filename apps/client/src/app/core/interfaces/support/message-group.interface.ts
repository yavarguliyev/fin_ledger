import type { SupportMessage } from '../../types/support/support-message.type';

export interface MessageGroupDto {
  dayLabel: string;
  messages: SupportMessage[];
}
