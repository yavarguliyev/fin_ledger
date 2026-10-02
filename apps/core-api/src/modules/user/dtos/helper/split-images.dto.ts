import { z } from 'zod';
import { UploadFile } from '@common/libs';

import { RejectedFileSchema } from '../storage/rejected-file.dto';

export const SplitImagesSchema = z.object({
  accepted: z.array(z.custom<UploadFile>()),

  rejected: z.array(RejectedFileSchema),

  status: z.number({ message: 'Status must be a number' }).int()
});

export type SplitImagesDto = z.infer<typeof SplitImagesSchema>;
