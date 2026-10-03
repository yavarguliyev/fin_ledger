import { z } from 'zod';

import { SUPPORT_CALL } from '../../constants/call/support-call.constant';

export const CallRenegotiateRequestSchema = z.object({
  sdp: z.string({ message: 'SDP must be a string' }).min(1).max(SUPPORT_CALL.SDP_MAX_LENGTH),

  sdpType: z.enum(SUPPORT_CALL.SDP_TYPES, { message: 'SDP type must be offer or answer' })
});

export type CallRenegotiateRequestDto = z.infer<typeof CallRenegotiateRequestSchema>;
