import { z } from 'zod';

export const RescheduleJobSchema = z.object({
  jobId: z.string({ message: 'Job ID must be a string' }),

  message: z.string({ message: 'Message must be a string' }),

  delayMs: z.number({ message: 'Delay must be a number' }).int().nonnegative()
});

export type RescheduleJobDto = z.infer<typeof RescheduleJobSchema>;
