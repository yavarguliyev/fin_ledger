import type { CallMedia } from '../../types/support/call-media.type';

export interface StartCallDto {
  conversationId: string;
  media: CallMedia;
  sdp: string;
}
