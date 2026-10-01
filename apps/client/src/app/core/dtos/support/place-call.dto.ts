import type { CallMedia } from '../../types/support/call-media.type';

export interface PlaceCallDto {
  conversationId: string;
  media: CallMedia;
  peerName: string;
}
