import { z } from 'zod';

import { SUPPORT_CALL } from '../../constants/call/support-call.constant';

export const IceCandidateSchema = z.object({
  candidate: z.string({ message: 'Candidate must be a string' }).max(SUPPORT_CALL.CANDIDATE_MAX_LENGTH),

  sdpMid: z.string({ message: 'SDP mid must be a string' }).nullable().optional(),

  sdpMLineIndex: z.number({ message: 'SDP line index must be a number' }).int().nonnegative().nullable().optional()
});

export type IceCandidateDto = z.infer<typeof IceCandidateSchema>;
