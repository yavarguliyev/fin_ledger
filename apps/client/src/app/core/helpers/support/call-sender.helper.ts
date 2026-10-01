import { PeerRefDto } from '../../dtos/support/peer-ref.dto';
import { SenderTuningDto } from '../../dtos/support/sender-tuning.dto';
import { SUPPORT_CALL } from '../../constants/support/support-call.constant';

export class CallSenderHelper {
  static videoSender ({ peer }: PeerRefDto): RTCRtpSender | undefined {
    const video = (peer?.getTransceivers() ?? []).filter(item => item.receiver.track.kind === SUPPORT_CALL.VIDEO_TRACK && !!item.mid);
    return (video.find(item => item.sender.track?.kind === SUPPORT_CALL.VIDEO_TRACK) ?? video[0])?.sender;
  }

  static async tune ({ sender, sharing }: SenderTuningDto): Promise<void> {
    const parameters = sender.getParameters();
    const [encoding] = parameters.encodings ?? [];

    parameters.degradationPreference = sharing ? SUPPORT_CALL.SCREEN_DEGRADATION : SUPPORT_CALL.CAMERA_DEGRADATION;
    if (encoding) {
      if (sharing) encoding.maxBitrate = SUPPORT_CALL.SCREEN_MAX_BITRATE;
      else delete encoding.maxBitrate;
    }

    await sender.setParameters(parameters).catch(() => undefined);
  }
}
