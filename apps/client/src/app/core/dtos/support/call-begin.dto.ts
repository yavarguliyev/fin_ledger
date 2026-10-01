import type { CallMedia } from '../../types/support/call-media.type';
import type { CallPhase } from '../../types/support/call-phase.type';

export interface CallBeginDto {
  phase: CallPhase;
  media: CallMedia;
  peerName: string;
}
