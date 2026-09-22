import { z } from 'zod';

import { AuthenticatedRequest } from '../../interfaces/authenticated-request.interface';

export const RateLimitRequestSchema = z.object({
  request: z.custom<Partial<AuthenticatedRequest>>()
});

export type RateLimitRequestDto = z.infer<typeof RateLimitRequestSchema>;
