import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const UploadFilesSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  files: z.custom<UploadFile[]>()
});

export type UploadFilesDto = z.infer<typeof UploadFilesSchema>;
