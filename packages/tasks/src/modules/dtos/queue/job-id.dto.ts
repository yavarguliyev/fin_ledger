import { z } from 'zod';

export const JobIdSchema = z.object({ jobId: z.string({ message: 'Job ID must be a string' }) });

export type JobIdDto = z.infer<typeof JobIdSchema>;
