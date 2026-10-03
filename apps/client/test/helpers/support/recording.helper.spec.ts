import { MessageRulesHelper } from '../../../src/app/core/helpers/support/message-rules.helper';
import { RECORDING_TEST } from '../../constants/recording.constant';
import { RecordingHelper } from '../../../src/app/core/helpers/support/recording.helper';
import { SupportAttachmentHelper } from '../../../src/app/core/helpers/support/support-attachment.helper';
import { aSupportMessage } from '../../fakes/support.fake';

describe('RecordingHelper', () => {
  it('asks only for the microphone for a voice message', () => {
    expect(RecordingHelper.constraints({ kind: RECORDING_TEST.VOICE })).toEqual({ audio: true, video: false });
  });

  it('asks for a square front camera for a video message', () => {
    const video = RecordingHelper.constraints({ kind: RECORDING_TEST.VIDEO }).video as MediaTrackConstraints;

    expect(video.width).toBe(RECORDING_TEST.VIDEO_SIZE);
    expect(video.height).toBe(RECORDING_TEST.VIDEO_SIZE);
  });

  it('drops codec details so the server sees a plain media type', () => {
    expect(RecordingHelper.baseType({ type: RECORDING_TEST.CODEC_TYPE })).toBe(RECORDING_TEST.BASE_TYPE);
  });

  it('lets a recorded voice message through the attachment checks', () => {
    const file = new File(['x'], RECORDING_TEST.FILE_NAME, { type: RECORDING_TEST.CODEC_TYPE });

    expect(SupportAttachmentHelper.problemWith({ files: [file] })).toBeNull();
  });

  it('never offers to edit a voice or video message', () => {
    const message = aSupportMessage({ kind: RECORDING_TEST.VOICE_KIND, senderUserId: RECORDING_TEST.OWNER, deletedAt: null, createdAt: new Date().toISOString() });

    expect(MessageRulesHelper.canEdit({ message, userId: RECORDING_TEST.OWNER })).toBe(false);
  });
});
