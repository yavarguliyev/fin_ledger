import { z } from 'zod';

export const BuildCacheKeySchema = z.object({
  prefix: z.string({ message: 'Prefix must be a string' }),

  method: z.string({ message: 'Method must be a string' }),

  args: z.array(z.unknown()),

  scope: z.string({ message: 'Scope must be a string' }).optional()
});

export type BuildCacheKeyDto = z.infer<typeof BuildCacheKeySchema>;
