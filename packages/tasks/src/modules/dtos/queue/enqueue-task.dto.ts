import { z } from 'zod';
import type { DatabaseAdapter } from '@common/database';

export const EnqueueTaskSchema = z.object({
  name: z.string({ message: 'Task name must be a string' }).min(1, { message: 'Task name is required' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }).optional(),

  runAt: z.string({ message: 'Run at must be an ISO string' }).optional(),

  maxAttempts: z.number({ message: 'Max attempts must be a number' }).int().positive().optional(),

  dedupeKey: z.string({ message: 'Dedupe key must be a string' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type EnqueueTaskDto = z.infer<typeof EnqueueTaskSchema>;
