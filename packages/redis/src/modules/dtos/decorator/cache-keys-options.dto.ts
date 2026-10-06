import { z } from 'zod';

export const CacheKeysOptionsSchema = z.object({
  keys: z.custom<(input: never, result: never) => string[]>()
});

export type CacheKeysOptionsDto = z.infer<typeof CacheKeysOptionsSchema>;
