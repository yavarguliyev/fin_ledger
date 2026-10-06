import { z } from 'zod';

import { USER_ADDRESS } from '../../constants/address/user-address.constant';

export const AddressRequestSchema = z.object({
  line1: z.string({ message: 'Street address is required' }).trim().min(1, { message: 'Street address is required' }).max(USER_ADDRESS.LINE_MAX),

  line2: z.string({ message: 'Line 2 must be text' }).trim().max(USER_ADDRESS.LINE_MAX).optional(),

  city: z.string({ message: 'City is required' }).trim().min(1, { message: 'City is required' }).max(USER_ADDRESS.CITY_MAX),

  region: z.string({ message: 'Region must be text' }).trim().max(USER_ADDRESS.CITY_MAX).optional(),

  postalCode: z.string({ message: 'Postal code must be text' }).trim().max(USER_ADDRESS.POSTAL_MAX).optional(),

  countryCode: z.string({ message: 'Country is required' }).regex(USER_ADDRESS.COUNTRY_PATTERN, { message: 'Pick a country' }),

  latitude: z.number({ message: 'Latitude must be a number' }).min(-USER_ADDRESS.LATITUDE_MAX).max(USER_ADDRESS.LATITUDE_MAX).optional(),

  longitude: z.number({ message: 'Longitude must be a number' }).min(-USER_ADDRESS.LONGITUDE_MAX).max(USER_ADDRESS.LONGITUDE_MAX).optional(),

  source: z.enum(USER_ADDRESS.SOURCES, { message: 'Source must be MANUAL, MAP or CURRENT_LOCATION' })
});

export type AddressRequestDto = z.infer<typeof AddressRequestSchema>;
