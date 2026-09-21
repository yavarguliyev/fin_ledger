import { z } from 'zod';

export const ParseExpirySchema = z.object({
  expiry: z.string({ message: 'Expiry must be a string' })
});

export type ParseExpiryDto = z.infer<typeof ParseExpirySchema>;
