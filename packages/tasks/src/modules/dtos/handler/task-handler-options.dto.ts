import { z } from 'zod';

export const TaskHandlerOptionsSchema = z.object({
  name: z.string({ message: 'Task name must be a string' }).min(1, { message: 'Task name is required' }),

  maxAttempts: z.number({ message: 'Max attempts must be a number' }).int().positive().optional()
});

export type TaskHandlerOptionsDto = z.infer<typeof TaskHandlerOptionsSchema>;
