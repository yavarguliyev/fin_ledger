import { SUPPORT_CALL } from '../../constants/support/support-call.constant';

export type CallEndReason =
  | typeof SUPPORT_CALL.HANGUP
  | typeof SUPPORT_CALL.DECLINED
  | typeof SUPPORT_CALL.MISSED
  | typeof SUPPORT_CALL.BUSY
  | typeof SUPPORT_CALL.FAILED;
