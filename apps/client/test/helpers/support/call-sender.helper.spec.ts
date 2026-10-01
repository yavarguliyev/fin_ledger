import { CALL_SENDER_TEST } from '../../constants/call-sender.constant';
import { CallSenderHelper } from '../../../src/app/core/helpers/support/call-sender.helper';

const sender = (kind: string | null): RTCRtpSender => ({ track: kind ? { kind } : null }) as unknown as RTCRtpSender;
const transceiver = (receiverKind: string, mid: string | null, senderKind: string | null): RTCRtpTransceiver =>
  ({ receiver: { track: { kind: receiverKind } }, mid, sender: sender(senderKind) }) as unknown as RTCRtpTransceiver;
const peerWith = (transceivers: RTCRtpTransceiver[]): RTCPeerConnection => ({ getTransceivers: () => transceivers }) as unknown as RTCPeerConnection;

describe('CallSenderHelper', () => {
  it('shares the screen on the negotiated camera channel, never on an unused duplicate', () => {
    const unused = transceiver(CALL_SENDER_TEST.VIDEO, null, CALL_SENDER_TEST.VIDEO);
    const camera = transceiver(CALL_SENDER_TEST.VIDEO, CALL_SENDER_TEST.MID, CALL_SENDER_TEST.VIDEO);
    const audio = transceiver(CALL_SENDER_TEST.AUDIO, CALL_SENDER_TEST.MID, CALL_SENDER_TEST.AUDIO);

    expect(CallSenderHelper.videoSender({ peer: peerWith([unused, audio, camera]) })).toBe(camera.sender);
  });

  it('falls back to the spare video channel on a voice call', () => {
    const spare = transceiver(CALL_SENDER_TEST.VIDEO, CALL_SENDER_TEST.MID, null);

    expect(CallSenderHelper.videoSender({ peer: peerWith([spare]) })).toBe(spare.sender);
  });

  it('keeps shared screens sharp and restores camera settings afterwards', async () => {
    const parameters = { encodings: [{}] } as RTCRtpSendParameters;
    const target = { getParameters: () => parameters, setParameters: jest.fn().mockResolvedValue(undefined) } as unknown as RTCRtpSender;

    await CallSenderHelper.tune({ sender: target, sharing: true });
    expect(parameters.degradationPreference).toBe(CALL_SENDER_TEST.SCREEN_DEGRADATION);
    expect(parameters.encodings[0]?.maxBitrate).toBe(CALL_SENDER_TEST.SCREEN_BITRATE);

    await CallSenderHelper.tune({ sender: target, sharing: false });
    expect(parameters.degradationPreference).toBe(CALL_SENDER_TEST.CAMERA_DEGRADATION);
    expect(parameters.encodings[0]?.maxBitrate).toBeUndefined();
  });
});
