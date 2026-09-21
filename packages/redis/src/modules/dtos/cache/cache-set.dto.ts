import { z } from 'zod';

export const CacheSetSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  value: z.unknown(),

  ttlSeconds: z.number({ message: 'TTL must be a number' }).int().positive().optional()
});

export type CacheSetDto = z.infer<typeof CacheSetSchema>;
