import { PinDuration } from '../../types/support/pin-duration.type';

export interface PinMessageDto {
  conversationId: string;
  messageId: string;
  duration: PinDuration;
}
