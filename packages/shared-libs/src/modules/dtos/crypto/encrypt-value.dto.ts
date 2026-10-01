import { z } from 'zod';

export const EncryptValueSchema = z.object({
  plaintext: z.string({ message: 'Plaintext must be a string' }),

  key: z.custom<Buffer>()
});

export type EncryptValueDto = z.infer<typeof EncryptValueSchema>;
