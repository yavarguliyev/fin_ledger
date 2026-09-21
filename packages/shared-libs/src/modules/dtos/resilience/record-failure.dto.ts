import { z } from 'zod';

export const RecordFailureSchema = z.object({
  retryable: z.boolean({ message: 'Retryable must be a boolean' })
});

export type RecordFailureDto = z.infer<typeof RecordFailureSchema>;
