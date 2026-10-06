import { z } from 'zod';

export const GeocodeUrlSchema = z.object({
  url: z.instanceof(URL, { message: 'URL must be a URL' })
});

export type GeocodeUrlDto = z.infer<typeof GeocodeUrlSchema>;
