import { z } from 'zod';

import { RejectedFileSchema } from './rejected-file.dto';

export const UploadImagesResponseSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  files: z.array(z.string({ message: 'File path must be a string' })),

  rejected: z.array(RejectedFileSchema)
});

export type UploadImagesResponseDto = z.infer<typeof UploadImagesResponseSchema>;
