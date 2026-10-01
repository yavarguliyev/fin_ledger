import type { CallMedia } from '../../types/support/call-media.type';

export interface OpenCallSessionDto {
  media: CallMedia;
  iceServers: RTCIceServer[];
  onCandidate: (candidate: RTCIceCandidateInit) => void;
  onState: (state: RTCPeerConnectionState) => void;
}
