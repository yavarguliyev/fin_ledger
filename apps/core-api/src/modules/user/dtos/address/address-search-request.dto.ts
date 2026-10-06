import { z } from 'zod';

import { GEOCODER } from '../../constants/address/geocode.constant';

export const AddressSearchRequestSchema = z.object({
  q: z.string({ message: 'Type part of an address' }).trim().min(GEOCODER.QUERY_MIN, { message: 'Type at least three characters' }).max(GEOCODER.QUERY_MAX)
});

export type AddressSearchRequestDto = z.infer<typeof AddressSearchRequestSchema>;
