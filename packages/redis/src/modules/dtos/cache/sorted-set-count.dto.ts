import { z } from 'zod';

export const SortedSetCountSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  min: z.number({ message: 'Minimum score must be a number' })
});

export type SortedSetCountDto = z.infer<typeof SortedSetCountSchema>;
