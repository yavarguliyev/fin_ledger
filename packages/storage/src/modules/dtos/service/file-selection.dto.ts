import { z } from 'zod';

export const FileSelectionSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  indexes: z.array(z.number({ message: 'Each index must be a number' }).int().nonnegative()).optional()
});

export type FileSelectionDto = z.infer<typeof FileSelectionSchema>;
