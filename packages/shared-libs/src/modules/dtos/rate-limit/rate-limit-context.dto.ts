import { ExecutionContext } from '@nestjs/common';
import { z } from 'zod';

export const RateLimitContextSchema = z.object({ context: z.custom<ExecutionContext>() });

export type RateLimitContextDto = z.infer<typeof RateLimitContextSchema>;
