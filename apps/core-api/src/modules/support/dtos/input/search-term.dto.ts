import { z } from 'zod';

export const SearchTermSchema = z.object({
  term: z.string()
});

export type SearchTermDto = z.infer<typeof SearchTermSchema>;
