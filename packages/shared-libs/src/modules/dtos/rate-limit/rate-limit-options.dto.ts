import { z } from 'zod';
import { ThrottlerStorage } from '@nestjs/throttler';

export const RateLimitOptionsSchema = z.object({
  storage: z.custom<ThrottlerStorage>()
});

export type RateLimitOptionsDto = z.infer<typeof RateLimitOptionsSchema>;
