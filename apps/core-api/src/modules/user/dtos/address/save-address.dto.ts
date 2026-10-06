import { z } from 'zod';

import { AddressRequestSchema } from './address-request.dto';

export const SaveAddressSchema = AddressRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1)
});

export type SaveAddressDto = z.infer<typeof SaveAddressSchema>;
