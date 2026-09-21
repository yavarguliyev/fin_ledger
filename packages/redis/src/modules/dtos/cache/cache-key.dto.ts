import { z } from 'zod';

export const CacheKeySchema = z.object({
  key: z.string({ message: 'Key must be a string' })
});

export type CacheKeyDto = z.infer<typeof CacheKeySchema>;
