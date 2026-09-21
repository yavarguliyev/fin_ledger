import { z } from 'zod';

export const FindPendingBatchSchema = z.object({
  limit: z.number({ message: 'Limit must be a number' }).int().positive()
});

export type FindPendingBatchDto = z.infer<typeof FindPendingBatchSchema>;
