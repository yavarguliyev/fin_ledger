import { z } from 'zod';

import { ClaimedJobSchema } from './claimed-job.dto';

export const JobFailureSchema = z.object({
  job: ClaimedJobSchema,

  message: z.string({ message: 'Message must be a string' })
});

export type JobFailureDto = z.infer<typeof JobFailureSchema>;
