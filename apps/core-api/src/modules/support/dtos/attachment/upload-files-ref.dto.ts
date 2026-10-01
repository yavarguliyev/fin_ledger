import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const UploadFilesRefSchema = z.object({ files: z.array(z.custom<UploadFile>()) });

export type UploadFilesRefDto = z.infer<typeof UploadFilesRefSchema>;
