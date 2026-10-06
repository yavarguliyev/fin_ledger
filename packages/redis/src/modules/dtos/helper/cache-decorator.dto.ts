import { z } from 'zod';

import { CacheStepDto } from './cache-step.dto';

export const CacheDecoratorSchema = z.object({
  step: z.custom<(dto: CacheStepDto) => Promise<unknown>>()
});

export type CacheDecoratorDto = z.infer<typeof CacheDecoratorSchema>;
