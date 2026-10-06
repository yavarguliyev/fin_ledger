import { z } from 'zod';

export const CacheClaimOptionsSchema = z.object({
  key: z.string().min(1),

  value: z.unknown(),

  ttlSeconds: z.number().int().positive()
});

export type CacheClaimOptionsDto = z.infer<typeof CacheClaimOptionsSchema>;
