import { z } from 'zod';

import { SelfExclusionRequestSchema } from '../request/self-exclusion-request.dto';

export const SetSelfExclusionSchema = SelfExclusionRequestSchema.extend({ userId: z.string({ message: 'User ID must be a string' }) });

export type SetSelfExclusionDto = z.infer<typeof SetSelfExclusionSchema>;
