import { CallAnnouncementDto } from '../../interfaces/support/call-announcement.interface';
import { SUPPORT_CALL } from '../../constants/support/support-call.constant';

export class CallAnnouncementHelper {
  static from ({ phase, status, peerName }: CallAnnouncementDto): string {
    if (phase === 'idle') return '';
    if (phase === 'active') return SUPPORT_CALL.CALL_CONNECTED;
    if (phase === 'incoming' && peerName) return `${status}${SUPPORT_CALL.ANNOUNCE_FROM}${peerName}`;
    return status;
  }
}
