import { ThrottlerStorage } from '@nestjs/throttler';
import { z } from 'zod';

export const RateLimitOptionsSchema = z.object({ storage: z.custom<ThrottlerStorage>() });

export type RateLimitOptionsDto = z.infer<typeof RateLimitOptionsSchema>;
