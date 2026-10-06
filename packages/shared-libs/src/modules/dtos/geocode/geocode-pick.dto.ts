import { z } from 'zod';

export const GeocodePickSchema = z.object({
  address: z.record(z.string(), z.string()),

  keys: z.array(z.string())
});

export type GeocodePickDto = z.infer<typeof GeocodePickSchema>;
