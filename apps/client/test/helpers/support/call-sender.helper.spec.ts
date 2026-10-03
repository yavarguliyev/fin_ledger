import { CALL_SENDER_TEST } from '../../constants/call-sender.constant';
import { CallSenderHelper } from '../../../src/app/core/helpers/support/call-sender.helper';
import { aPeer, aTransceiver, aTunableSender } from '../../fakes/rtc.fake';


describe('CallSenderHelper', () => {
  it('shares the screen on the negotiated camera channel, never on an unused duplicate', () => {
    const unused = aTransceiver({ receiverKind: CALL_SENDER_TEST.VIDEO, mid: null, senderKind: CALL_SENDER_TEST.VIDEO });
    const camera = aTransceiver({ receiverKind: CALL_SENDER_TEST.VIDEO, mid: CALL_SENDER_TEST.MID, senderKind: CALL_SENDER_TEST.VIDEO });
    const audio = aTransceiver({ receiverKind: CALL_SENDER_TEST.AUDIO, mid: CALL_SENDER_TEST.MID, senderKind: CALL_SENDER_TEST.AUDIO });

    expect(CallSenderHelper.videoSender({ peer: aPeer({ transceivers: [unused, audio, camera] }) })).toBe(camera.sender);
  });

  it('falls back to the spare video channel on a voice call', () => {
    const spare = aTransceiver({ receiverKind: CALL_SENDER_TEST.VIDEO, mid: CALL_SENDER_TEST.MID, senderKind: null });

    expect(CallSenderHelper.videoSender({ peer: aPeer({ transceivers: [spare] }) })).toBe(spare.sender);
  });

  it('keeps shared screens sharp and restores camera settings afterwards', async () => {
    const parameters = { encodings: [{}] } as RTCRtpSendParameters;
    const target = aTunableSender({ parameters, setParameters: jest.fn().mockResolvedValue(undefined) });

    await CallSenderHelper.tune({ sender: target, sharing: true });
    expect(parameters.degradationPreference).toBe(CALL_SENDER_TEST.SCREEN_DEGRADATION);
    expect(parameters.encodings[0]?.maxBitrate).toBe(CALL_SENDER_TEST.SCREEN_BITRATE);

    await CallSenderHelper.tune({ sender: target, sharing: false });
    expect(parameters.degradationPreference).toBe(CALL_SENDER_TEST.CAMERA_DEGRADATION);
    expect(parameters.encodings[0]?.maxBitrate).toBeUndefined();
  });
});
