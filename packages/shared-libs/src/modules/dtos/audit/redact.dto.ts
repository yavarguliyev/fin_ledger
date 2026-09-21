import { z } from 'zod';

export const RedactSchema = z.object({
  state: z.unknown()
});

export type RedactDto = z.infer<typeof RedactSchema>;
