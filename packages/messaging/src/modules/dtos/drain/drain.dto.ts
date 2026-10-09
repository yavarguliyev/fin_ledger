import type { Logger } from '@nestjs/common';
import { z } from 'zod';

export const DrainSchema = z.object({
  pending: z.custom<() => number>(),

  logger: z.custom<Logger>()
});

export type DrainDto = z.infer<typeof DrainSchema>;
