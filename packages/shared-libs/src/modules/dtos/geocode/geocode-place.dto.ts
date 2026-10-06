import { z } from 'zod';

export const GeocodePlaceSchema = z.object({
  display_name: z.string({ message: 'Display name must be a string' }),

  lat: z.string({ message: 'Latitude must be a string' }),

  lon: z.string({ message: 'Longitude must be a string' }),

  address: z.record(z.string(), z.string()).optional()
});

export type GeocodePlaceDto = z.infer<typeof GeocodePlaceSchema>;
