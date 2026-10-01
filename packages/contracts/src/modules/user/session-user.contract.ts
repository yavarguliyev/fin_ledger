import { z } from 'zod';

import { UserIdentityContractSchema } from './user-identity.contract';

export const SessionUserContractSchema = UserIdentityContractSchema.extend({
  lastLoginAt: z.iso.datetime({ message: 'Last login must be a valid ISO datetime' }).nullable(),

  selfExclusionUntil: z.iso.datetime({ message: 'Self exclusion until must be a valid ISO datetime' }).nullable(),

  mfaSetupRequired: z.boolean({ message: 'MFA setup required must be a boolean' }).optional()
});

export type SessionUserContract = z.infer<typeof SessionUserContractSchema>;
