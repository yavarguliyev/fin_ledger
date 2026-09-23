import { z } from 'zod';

export const AttemptSchema = z.object({
  attempt: z.number({ message: 'Attempt must be a number' }).int().positive()
});

export type AttemptDto = z.infer<typeof AttemptSchema>;
