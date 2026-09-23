import { z } from 'zod';

export const ConnectionUrlSchema = z.object({
  url: z.string({ message: 'Connection URL must be a string' })
});

export type ConnectionUrlDto = z.infer<typeof ConnectionUrlSchema>;
