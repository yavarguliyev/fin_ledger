import { z } from 'zod';

export const GeocodedAddressSchema = z.object({
  label: z.string({ message: 'Label must be a string' }),

  line1: z.string({ message: 'Line 1 must be a string' }).nullable(),

  city: z.string({ message: 'City must be a string' }).nullable(),

  region: z.string({ message: 'Region must be a string' }).nullable(),

  postalCode: z.string({ message: 'Postal code must be a string' }).nullable(),

  countryCode: z.string({ message: 'Country code must be a string' }).nullable(),

  latitude: z.number({ message: 'Latitude must be a number' }),

  longitude: z.number({ message: 'Longitude must be a number' })
});

export type GeocodedAddressDto = z.infer<typeof GeocodedAddressSchema>;
