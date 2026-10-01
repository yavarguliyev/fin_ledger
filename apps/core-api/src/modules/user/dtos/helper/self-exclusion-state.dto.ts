import { z } from 'zod';

export const SelfExclusionStateSchema = z.object({
  selfExclusionUntil: z.string({ message: 'Self exclusion until must be a string' }).nullable().optional()
});

export type SelfExclusionStateDto = z.infer<typeof SelfExclusionStateSchema>;
