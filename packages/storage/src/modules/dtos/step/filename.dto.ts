import { z } from 'zod';

export const FilenameSchema = z.object({
  filename: z.string({ message: 'Filename must be a string' })
});

export type FilenameDto = z.infer<typeof FilenameSchema>;
