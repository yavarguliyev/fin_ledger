import { z } from 'zod';

import { ContentDispositionSchema } from './content-disposition.dto';

export const DownloadUrlSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  expiresIn: z.number({ message: 'Expires in must be a number' }).int().positive().optional(),

  contentDisposition: ContentDispositionSchema.optional()
});

export type DownloadUrlDto = z.infer<typeof DownloadUrlSchema>;
