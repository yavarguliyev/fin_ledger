import { z } from 'zod';

export const ReplayDeadLettersSchema = z.object({
  queue: z.string({ message: 'Queue must be a string' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive().optional()
});

export type ReplayDeadLettersDto = z.infer<typeof ReplayDeadLettersSchema>;
