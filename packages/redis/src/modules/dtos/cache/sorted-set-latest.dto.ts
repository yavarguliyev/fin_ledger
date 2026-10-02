import { z } from 'zod';

export const SortedSetLatestSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  min: z.number({ message: 'Minimum score must be a number' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive()
});

export type SortedSetLatestDto = z.infer<typeof SortedSetLatestSchema>;
