import { z } from 'zod';

export const ChallengeScopeSchema = z.object({
  scope: z.string({ message: 'Scope must be a string' }),

  owner: z.string({ message: 'Owner must be a string' })
});

export type ChallengeScopeDto = z.infer<typeof ChallengeScopeSchema>;
