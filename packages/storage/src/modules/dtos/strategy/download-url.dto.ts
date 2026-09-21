import { z } from 'zod';

export const DownloadUrlSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  expiresIn: z.number({ message: 'Expires in must be a number' }).int().positive().optional()
});

export type DownloadUrlDto = z.infer<typeof DownloadUrlSchema>;
