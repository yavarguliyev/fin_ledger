import { SupportCallEndReason, SupportCallMedia } from '@common/libs';

import { CallEndingDto } from '../dtos/call/call-ending.dto';
import { SUPPORT_CALL } from '../constants/call/support-call.constant';

export class CallLogHelper {
  static label ({ call, reason }: CallEndingDto): string {
    const video = call.media === SupportCallMedia.VIDEO;

    if (!call.answeredAt || reason === SupportCallEndReason.MISSED) return video ? SUPPORT_CALL.MISSED_VIDEO_LABEL : SUPPORT_CALL.MISSED_VOICE_LABEL;

    const seconds = Math.max(0, Math.round((Date.now() - new Date(call.answeredAt).getTime()) / SUPPORT_CALL.MS_PER_SECOND));
    const minutes = String(Math.floor(seconds / SUPPORT_CALL.SECONDS_PER_MINUTE)).padStart(SUPPORT_CALL.PAD_LENGTH, SUPPORT_CALL.PAD_CHAR);
    const rest = String(seconds % SUPPORT_CALL.SECONDS_PER_MINUTE).padStart(SUPPORT_CALL.PAD_LENGTH, SUPPORT_CALL.PAD_CHAR);

    return `${video ? SUPPORT_CALL.VIDEO_LABEL : SUPPORT_CALL.VOICE_LABEL}${SUPPORT_CALL.LABEL_SEPARATOR}${minutes}${SUPPORT_CALL.TIME_SEPARATOR}${rest}`;
  }
}
