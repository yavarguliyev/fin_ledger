import { z } from 'zod';

import { USER_ADDRESS } from '../../constants/address/user-address.constant';

export const AddressSchema = z.object({
  line1: z.string({ message: 'Line 1 must be a string' }),

  line2: z.string({ message: 'Line 2 must be a string' }).nullable(),

  city: z.string({ message: 'City must be a string' }),

  region: z.string({ message: 'Region must be a string' }).nullable(),

  postalCode: z.string({ message: 'Postal code must be a string' }).nullable(),

  countryCode: z.string({ message: 'Country code must be a string' }),

  latitude: z.number({ message: 'Latitude must be a number' }).nullable(),

  longitude: z.number({ message: 'Longitude must be a number' }).nullable(),

  source: z.enum(USER_ADDRESS.SOURCES, { message: 'Source must be a valid address source' }),

  updatedAt: z.date({ message: 'Updated at must be a date' })
});

export type AddressDto = z.infer<typeof AddressSchema>;
