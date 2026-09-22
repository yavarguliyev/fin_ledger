import { z } from 'zod';

import { UploadFile } from '../../interfaces/upload-file.interface';

export const NormalizeImageSchema = z.object({
  file: z.custom<UploadFile>()
});

export type NormalizeImageDto = z.infer<typeof NormalizeImageSchema>;
