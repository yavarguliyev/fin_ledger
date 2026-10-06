import { z } from 'zod';

export const CacheWriteOptionsSchema = z.object({
  key: z.custom<(input: never, result: never) => string>(),

  ttlSeconds: z.number().int().positive().optional(),

  value: z.custom<(result: never) => unknown>().optional()
});

export type CacheWriteOptionsDto = z.infer<typeof CacheWriteOptionsSchema>;
