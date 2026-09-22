import { z } from 'zod';
import { ExecutionContext } from '@nestjs/common';

export const RateLimitContextSchema = z.object({
  context: z.custom<ExecutionContext>()
});

export type RateLimitContextDto = z.infer<typeof RateLimitContextSchema>;
