import { z } from 'zod';

export const RecordUsageSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  signCount: z.number({ message: 'Sign count must be a number' })
});

export type RecordUsageDto = z.infer<typeof RecordUsageSchema>;
