import type { CallMedia } from '../../types/support/call-media.type';

export interface OpenCallLinkDto {
  media: CallMedia;
  onConnected: () => void;
  onFailed: () => void;
}
