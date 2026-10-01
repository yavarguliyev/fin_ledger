import { z } from 'zod';

export const ClaimedJobSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  name: z.string({ message: 'Name must be a string' }),

  payload: z.record(z.string(), z.unknown()),

  attempts: z.number({ message: 'Attempts must be a number' }).int(),

  maxAttempts: z.number({ message: 'Max attempts must be a number' }).int()
});

export type ClaimedJobDto = z.infer<typeof ClaimedJobSchema>;
