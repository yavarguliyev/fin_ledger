import { z } from 'zod';

export const CachePatternSchema = z.object({
  pattern: z.string({ message: 'Pattern must be a string' })
});

export type CachePatternDto = z.infer<typeof CachePatternSchema>;
