import { z } from 'zod';

import { USER_ADDRESS } from '../../constants/address/user-address.constant';

export const ReverseGeocodeRequestSchema = z.object({
  latitude: z.coerce.number({ message: 'Latitude must be a number' }).min(-USER_ADDRESS.LATITUDE_MAX).max(USER_ADDRESS.LATITUDE_MAX),

  longitude: z.coerce.number({ message: 'Longitude must be a number' }).min(-USER_ADDRESS.LONGITUDE_MAX).max(USER_ADDRESS.LONGITUDE_MAX)
});

export type ReverseGeocodeRequestDto = z.infer<typeof ReverseGeocodeRequestSchema>;
