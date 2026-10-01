import { z } from 'zod';

import { IceCandidateSchema } from '../call/ice-candidate.dto';

export const CallCandidateRequestSchema = z.object({ candidate: IceCandidateSchema });

export type CallCandidateRequestDto = z.infer<typeof CallCandidateRequestSchema>;
