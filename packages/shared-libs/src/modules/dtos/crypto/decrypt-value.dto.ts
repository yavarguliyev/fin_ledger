import { z } from 'zod';

export const DecryptValueSchema = z.object({
  encrypted: z.custom<Buffer>(),

  key: z.custom<Buffer>()
});

export type DecryptValueDto = z.infer<typeof DecryptValueSchema>;
