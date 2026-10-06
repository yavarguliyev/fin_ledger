import { z } from 'zod';

export const SpentRowSchema = z.object({
  spent: z.string({ message: 'Spent must be a string' })
});

export type SpentRowDto = z.infer<typeof SpentRowSchema>;
