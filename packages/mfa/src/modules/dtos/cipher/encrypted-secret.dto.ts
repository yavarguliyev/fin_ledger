import { z } from 'zod';

export const EncryptedSecretSchema = z.object({
  encrypted: z.custom<Buffer>()
});

export type EncryptedSecretDto = z.infer<typeof EncryptedSecretSchema>;
