import { z } from 'zod';

export const ObjectPrefixSchema = z.object({
  prefix: z.string({ message: 'Prefix must be a string' })
});

export type ObjectPrefixDto = z.infer<typeof ObjectPrefixSchema>;
