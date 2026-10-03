export interface SenderFakeDto {
  kind: string | null;
}

export interface TransceiverFakeDto {
  receiverKind: string;
  mid: string | null;
  senderKind: string | null;
}

export interface PeerFakeDto {
  transceivers: RTCRtpTransceiver[];
}

export interface TunableSenderFakeDto {
  parameters: RTCRtpSendParameters;
  setParameters: jest.Mock;
}
