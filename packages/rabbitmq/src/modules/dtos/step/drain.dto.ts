import { z } from 'zod';
import type { Logger } from '@nestjs/common';

export const DrainSchema = z.object({
  pending: z.custom<() => number>(),

  logger: z.custom<Logger>()
});

export type DrainDto = z.infer<typeof DrainSchema>;
