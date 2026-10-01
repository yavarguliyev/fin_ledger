import type { CallEndReason } from '../../types/support/call-end-reason.type';

export interface CallReasonRefDto {
  reason: CallEndReason | undefined;
}
