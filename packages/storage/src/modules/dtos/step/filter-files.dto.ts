import { z } from 'zod';

export const FilterFilesSchema = z.object({
  files: z.array(z.string()),

  indexes: z.array(z.number({ message: 'Each index must be a number' }).int().nonnegative()).optional()
});

export type FilterFilesDto = z.infer<typeof FilterFilesSchema>;
