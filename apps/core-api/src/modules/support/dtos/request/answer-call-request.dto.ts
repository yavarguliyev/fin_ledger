import { z } from 'zod';

import { SUPPORT_CALL } from '../../constants/call/support-call.constant';

export const AnswerCallRequestSchema = z.object({ sdp: z.string({ message: 'SDP must be a string' }).min(1).max(SUPPORT_CALL.SDP_MAX_LENGTH) });

export type AnswerCallRequestDto = z.infer<typeof AnswerCallRequestSchema>;
