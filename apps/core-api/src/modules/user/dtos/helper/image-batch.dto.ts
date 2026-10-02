import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const ImageBatchSchema = z.object({
  files: z.array(z.custom<UploadFile>()),

  results: z.array(z.custom<PromiseSettledResult<UploadFile>>())
});

export type ImageBatchDto = z.infer<typeof ImageBatchSchema>;
