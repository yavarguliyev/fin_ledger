import { z } from 'zod';

import { CallCandidateRequestSchema } from '../request/call-candidate-request.dto';

export const RelayCandidateSchema = CallCandidateRequestSchema.extend({
  callId: z.string({ message: 'Call ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type RelayCandidateDto = z.infer<typeof RelayCandidateSchema>;
