import { PeerFakeDto, SenderFakeDto, TransceiverFakeDto, TunableSenderFakeDto } from '../interfaces/rtc-fake.interface';

export const aSender = ({ kind }: SenderFakeDto): RTCRtpSender => ({ track: kind ? { kind } : null }) as unknown as RTCRtpSender;

export const aTransceiver = ({ receiverKind, mid, senderKind }: TransceiverFakeDto): RTCRtpTransceiver =>
  ({ receiver: { track: { kind: receiverKind } }, mid, sender: aSender({ kind: senderKind }) }) as unknown as RTCRtpTransceiver;

export const aPeer = ({ transceivers }: PeerFakeDto): RTCPeerConnection => ({ getTransceivers: () => transceivers }) as unknown as RTCPeerConnection;

export const aTunableSender = ({ parameters, setParameters }: TunableSenderFakeDto): RTCRtpSender =>
  ({ getParameters: () => parameters, setParameters }) as unknown as RTCRtpSender;
