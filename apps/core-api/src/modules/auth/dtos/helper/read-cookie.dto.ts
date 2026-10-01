import { z } from 'zod';

export const ReadCookieSchema = z.object({
  header: z.string({ message: 'Cookie header must be a string' }).optional(),

  name: z.string({ message: 'Cookie name must be a string' })
});

export type ReadCookieDto = z.infer<typeof ReadCookieSchema>;
