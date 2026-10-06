import { z } from 'zod';

export const CacheKeyOptionsSchema = z.object({
  key: z.custom<(input: never) => string>()
});

export type CacheKeyOptionsDto = z.infer<typeof CacheKeyOptionsSchema>;
