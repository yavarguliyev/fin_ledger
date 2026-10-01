import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const UploadFileRefSchema = z.object({ file: z.custom<UploadFile>() });

export type UploadFileRefDto = z.infer<typeof UploadFileRefSchema>;
