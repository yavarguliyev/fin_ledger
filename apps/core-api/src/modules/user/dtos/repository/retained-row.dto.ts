import { z } from 'zod';

export const RetainedRowSchema = z.object({
  retained: z.boolean({ message: 'Retained must be a boolean' })
});

export type RetainedRowDto = z.infer<typeof RetainedRowSchema>;
