import { z } from 'zod';

export const FetchPageSchema = z.object({
  url: z.string({ message: 'URL must be a string' }),

  redirectsLeft: z.number({ message: 'Redirects left must be a number' }).int().nonnegative()
});

export type FetchPageDto = z.infer<typeof FetchPageSchema>;
