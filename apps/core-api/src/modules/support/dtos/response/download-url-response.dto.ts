import { z } from 'zod';

export const DownloadUrlResponseSchema = z.object({
  url: z.string({ message: 'URL must be a string' })
});

export type DownloadUrlResponseDto = z.infer<typeof DownloadUrlResponseSchema>;
