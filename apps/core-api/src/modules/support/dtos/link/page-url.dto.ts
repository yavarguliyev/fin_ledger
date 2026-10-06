import { z } from 'zod';

export const PageUrlSchema = z.object({
  url: z.instanceof(URL)
});

export type PageUrlDto = z.infer<typeof PageUrlSchema>;
