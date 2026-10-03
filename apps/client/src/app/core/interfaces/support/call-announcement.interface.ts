import { CallPhase } from '../../types/support/call-phase.type';

export interface CallAnnouncementDto {
  phase: CallPhase;
  status: string;
  peerName: string;
}
