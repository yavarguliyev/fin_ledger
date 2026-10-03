import type { CallEndReason } from '../../types/support/call-end-reason.type';
import type { CallMedia } from '../../types/support/call-media.type';

export interface CallSignal {
  callId: string;
  conversationId: string;
  media: CallMedia;
  fromUserId: string;
  fromName?: string;
  sdp?: string;
  sdpType?: RTCSdpType;
  candidate?: RTCIceCandidateInit;
  reason?: CallEndReason;
}
