import { z } from 'zod';

export const QueueNameSchema = z.object({
  queue: z.string({ message: 'Queue must be a string' })
});

export type QueueNameDto = z.infer<typeof QueueNameSchema>;
