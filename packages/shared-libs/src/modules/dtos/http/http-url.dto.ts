import { z } from 'zod';

export const HttpUrlSchema = z.object({
  url: z.string({ message: 'URL must be a string' })
});

export type HttpUrlDto = z.infer<typeof HttpUrlSchema>;
