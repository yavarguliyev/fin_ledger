import { z } from 'zod';

export const OpenWalletRequestSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }).regex(/^[A-Z]{3}$/, { message: 'Currency must be an uppercase 3-letter ISO code' })
});

export type OpenWalletRequestDto = z.infer<typeof OpenWalletRequestSchema>;
