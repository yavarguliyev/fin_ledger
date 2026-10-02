import { MimeTypeRefDto } from '../../interfaces/support/mime-type-ref.interface';
import { RecordingKindRefDto } from '../../interfaces/support/recording-kind-ref.interface';
import { SUPPORT_RECORDING } from '../../constants/support/support-recording.constant';

export class RecordingHelper {
  static mimeType ({ kind }: RecordingKindRefDto): string {
    const candidates = kind === SUPPORT_RECORDING.VOICE ? SUPPORT_RECORDING.VOICE_TYPES : SUPPORT_RECORDING.VIDEO_TYPES;
    return candidates.find(type => MediaRecorder.isTypeSupported(type)) ?? '';
  }

  static constraints ({ kind }: RecordingKindRefDto): MediaStreamConstraints {
    if (kind === SUPPORT_RECORDING.VOICE) return { audio: true, video: false };

    const size = SUPPORT_RECORDING.VIDEO_SIZE;
    return { audio: true, video: { width: size, height: size, facingMode: SUPPORT_RECORDING.FACING_MODE } };
  }

  static baseType ({ type }: MimeTypeRefDto): string {
    return type.split(SUPPORT_RECORDING.MIME_PARAMS_SEPARATOR)[0] ?? type;
  }
}
