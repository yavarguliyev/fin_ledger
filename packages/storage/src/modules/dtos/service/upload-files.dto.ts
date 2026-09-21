import { z } from 'zod';

import { UploadFile } from '../../interfaces/upload-file.interface';

export const UploadFilesSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  files: z.custom<UploadFile[]>()
});

export type UploadFilesDto = z.infer<typeof UploadFilesSchema>;
