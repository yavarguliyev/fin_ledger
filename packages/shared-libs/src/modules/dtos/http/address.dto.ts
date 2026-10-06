import { z } from 'zod';

export const AddressSchema = z.object({
  address: z.string({ message: 'Address must be a string' })
});

export type AddressDto = z.infer<typeof AddressSchema>;
