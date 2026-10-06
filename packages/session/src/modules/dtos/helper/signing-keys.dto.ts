import { z } from 'zod';

export const SigningKeysSchema = z.object({
  publicKey: z.string({ message: 'Public key must be a string' }),

  previousPublicKey: z.string({ message: 'Previous public key must be a string' }).optional()
});

export type SigningKeysDto = z.infer<typeof SigningKeysSchema>;
