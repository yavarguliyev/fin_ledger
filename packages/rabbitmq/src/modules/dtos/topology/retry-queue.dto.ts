import { z } from 'zod';

export const RetryQueueSchema = z.object({
  queue: z.string({ message: 'Queue must be a string' }),

  attempt: z.number({ message: 'Attempt must be a number' }).int().positive()
});

export type RetryQueueDto = z.infer<typeof RetryQueueSchema>;
