import { CallFailureDto } from '../../dtos/support/call-failure.dto';
import { CallReasonRefDto } from '../../dtos/support/call-reason-ref.dto';
import { SinceRefDto } from '../../dtos/support/since-ref.dto';
import { HttpRequestError } from '../../errors/http-request.error';
import { SUPPORT_CALL } from '../../constants/support/support-call.constant';

export class CallNoticeHelper {
  static forReason ({ reason }: CallReasonRefDto): string {
    if (reason === SUPPORT_CALL.DECLINED) return SUPPORT_CALL.DECLINED_NOTICE;
    if (reason === SUPPORT_CALL.BUSY) return SUPPORT_CALL.BUSY_NOTICE;
    if (reason === SUPPORT_CALL.MISSED) return SUPPORT_CALL.MISSED_NOTICE;
    if (reason === SUPPORT_CALL.FAILED) return SUPPORT_CALL.FAILED_NOTICE;
    return SUPPORT_CALL.CALL_ENDED;
  }

  static forFailure ({ error }: CallFailureDto): string {
    if (error instanceof DOMException && error.name === SUPPORT_CALL.PERMISSION_ERROR) return SUPPORT_CALL.MIC_DENIED;
    if (error instanceof HttpRequestError && error.status === SUPPORT_CALL.CONFLICT_STATUS) return error.message || SUPPORT_CALL.BUSY_NOTICE;
    return SUPPORT_CALL.FAILED_NOTICE;
  }

  static elapsed ({ since }: SinceRefDto): string {
    const seconds = Math.max(0, Math.floor((Date.now() - since) / SUPPORT_CALL.MS_PER_SECOND));
    const minutes = String(Math.floor(seconds / SUPPORT_CALL.SECONDS_PER_MINUTE)).padStart(SUPPORT_CALL.PAD_LENGTH, SUPPORT_CALL.PAD_CHAR);
    const rest = String(seconds % SUPPORT_CALL.SECONDS_PER_MINUTE).padStart(SUPPORT_CALL.PAD_LENGTH, SUPPORT_CALL.PAD_CHAR);
    return `${minutes}${SUPPORT_CALL.TIME_SEPARATOR}${rest}`;
  }
}
