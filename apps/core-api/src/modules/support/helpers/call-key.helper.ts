import { CallIdRefDto } from '../dtos/call/call-id-ref.dto';
import { SUPPORT_CALL } from '../constants/call/support-call.constant';
import { UserRefDto } from '../dtos/input/user-ref.dto';

export class CallKeyHelper {
  static callKey ({ callId }: CallIdRefDto): string {
    return `${SUPPORT_CALL.KEY_PREFIX}${callId}`;
  }

  static userKey ({ userId }: UserRefDto): string {
    return `${SUPPORT_CALL.USER_KEY_PREFIX}${userId}`;
  }
}
