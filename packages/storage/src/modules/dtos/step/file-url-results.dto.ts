import { z } from 'zod';

export const FileUrlResultsSchema = z.object({
  results: z.array(z.object({ url: z.string({ message: 'URL must be a string' }), filePath: z.string({ message: 'File path must be a string' }) })),

  files: z.array(z.string()),

  indexes: z.array(z.number({ message: 'Each index must be a number' }).int().nonnegative()).optional()
});

export type FileUrlResultsDto = z.infer<typeof FileUrlResultsSchema>;
