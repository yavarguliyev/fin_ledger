import { z } from 'zod';

import { UploadFile } from '../../interfaces/upload-file.interface';

export const ConvertToWebFormatSchema = z.object({
  file: z.custom<UploadFile>()
});

export type ConvertToWebFormatDto = z.infer<typeof ConvertToWebFormatSchema>;
