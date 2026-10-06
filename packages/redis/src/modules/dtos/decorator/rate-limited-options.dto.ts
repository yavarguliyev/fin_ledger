import { z } from 'zod';

export const RateLimitedOptionsSchema = z.object({
  key: z.string().min(1),

  limit: z.number().int().positive(),

  windowMs: z.number().int().positive(),

  error: z.custom<() => Error>()
});

export type RateLimitedOptionsDto = z.infer<typeof RateLimitedOptionsSchema>;
