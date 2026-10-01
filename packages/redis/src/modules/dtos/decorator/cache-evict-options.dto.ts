import { z } from 'zod';
import { CacheKey } from '@common/shared-libs';

export const CacheEvictOptionsSchema = z.object({
  keyPrefix: z.custom<CacheKey[]>(),

  targetMethodName: z.string().optional(),

  isPattern: z.boolean().optional(),

  scope: z.custom<(args: unknown[]) => string>().optional()
});

export type CacheEvictOptionsDto = z.infer<typeof CacheEvictOptionsSchema>;
