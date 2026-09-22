import { z } from 'zod';

export const RsaKeyPairSchema = z.object({
  publicKey: z.string({ message: 'Public key must be a string' }),

  privateKey: z.string({ message: 'Private key must be a string' })
});

export type RsaKeyPairDto = z.infer<typeof RsaKeyPairSchema>;
