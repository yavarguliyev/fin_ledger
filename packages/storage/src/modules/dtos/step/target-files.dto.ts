import { z } from 'zod';

export const TargetFilesSchema = z.object({
  files: z.array(z.string()),

  targetFiles: z.array(z.string())
});

export type TargetFilesDto = z.infer<typeof TargetFilesSchema>;
