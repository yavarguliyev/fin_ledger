import { z } from 'zod';

export const RejectedFileSchema = z.object({
  fileName: z.string({ message: 'File name must be a string' }),

  reason: z.string({ message: 'Reason must be a string' })
});

export type RejectedFileDto = z.infer<typeof RejectedFileSchema>;
