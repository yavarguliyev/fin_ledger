import { z } from 'zod';

export const FileIndexSchema = z.object({
  index: z.number({ message: 'Index must be a number' }).int(),

  files: z.array(z.string()),

  result: z.object({ url: z.string({ message: 'URL must be a string' }), filePath: z.string({ message: 'File path must be a string' }) }),

  indexes: z.array(z.number({ message: 'Each index must be a number' }).int().nonnegative()).optional()
});

export type FileIndexDto = z.infer<typeof FileIndexSchema>;
