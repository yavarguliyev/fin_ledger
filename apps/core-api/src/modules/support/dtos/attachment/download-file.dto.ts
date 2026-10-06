import { z } from 'zod';

export const DownloadFileSchema = z.object({
  storageKey: z.string({ message: 'Storage key must be a string' }).min(1),

  fileName: z.string({ message: 'File name must be a string' }).nullable()
});

export type DownloadFileDto = z.infer<typeof DownloadFileSchema>;
