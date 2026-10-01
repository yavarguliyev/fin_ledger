import { z } from 'zod';

import { SessionUserContractSchema } from './session-user.contract';

export const CurrentUserContractSchema = SessionUserContractSchema.extend({
  lastLoginIp: z.string({ message: 'Last login IP must be a string' }).nullable(),

  isEmailVerified: z.boolean({ message: 'Is email verified must be a boolean' }),

  updatedAt: z.iso.datetime({ message: 'Updated at must be a valid ISO datetime' })
});

export type CurrentUserContract = z.infer<typeof CurrentUserContractSchema>;
