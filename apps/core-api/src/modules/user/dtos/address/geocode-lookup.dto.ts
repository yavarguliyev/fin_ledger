import { z } from 'zod';

export const GeocodeLookupSchema = z.object({
  path: z.string({ message: 'Path must be a string' }).min(1),

  params: z.record(z.string(), z.string(), { message: 'Params must be text values' })
});

export type GeocodeLookupDto = z.infer<typeof GeocodeLookupSchema>;
