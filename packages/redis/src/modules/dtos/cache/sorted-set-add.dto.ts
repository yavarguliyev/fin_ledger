import { z } from 'zod';

export const SortedSetAddSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  member: z.string({ message: 'Member must be a string' }),

  score: z.number({ message: 'Score must be a number' })
});

export type SortedSetAddDto = z.infer<typeof SortedSetAddSchema>;
