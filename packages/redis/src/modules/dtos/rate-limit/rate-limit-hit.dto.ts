import { z } from 'zod';

export const RateLimitHitSchema = z.object({
  key: z.string().min(1),

  ttlMs: z.number().int().positive(),

  limit: z.number().int().positive(),

  blockDurationMs: z.number().int().positive()
});

export type RateLimitHitDto = z.infer<typeof RateLimitHitSchema>;
