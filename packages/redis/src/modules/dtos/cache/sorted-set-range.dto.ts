import { z } from 'zod';

export const SortedSetRangeSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  min: z.number({ message: 'Minimum score must be a number' }).optional(),

  max: z.number({ message: 'Maximum score must be a number' }).optional()
});

export type SortedSetRangeDto = z.infer<typeof SortedSetRangeSchema>;
