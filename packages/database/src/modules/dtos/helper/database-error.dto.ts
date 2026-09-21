import { z } from 'zod';

export const DatabaseErrorInputSchema = z.object({
  error: z.unknown()
});

export type DatabaseErrorInputDto = z.infer<typeof DatabaseErrorInputSchema>;
