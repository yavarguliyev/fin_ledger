import { z } from 'zod';

export const FetchedPageSchema = z.object({
  status: z.number().int(),

  location: z.string().optional(),

  contentType: z.string().optional(),

  html: z.string()
});

export type FetchedPageDto = z.infer<typeof FetchedPageSchema>;
