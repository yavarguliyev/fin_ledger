import type { CallEndReason } from '../../types/support/call-end-reason.type';

export interface EndCallDto {
  callId: string;
  reason: CallEndReason;
}
