import { z } from 'zod';

import { ChallengeScopeSchema } from './challenge-scope.dto';

export const StoreChallengeSchema = ChallengeScopeSchema.extend({ challenge: z.string({ message: 'Challenge must be a string' }) });

export type StoreChallengeDto = z.infer<typeof StoreChallengeSchema>;
