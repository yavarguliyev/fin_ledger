import { z } from 'zod';

export const ClassifyErrorSchema = z.object({
  error: z.unknown()
});

export type ClassifyErrorDto = z.infer<typeof ClassifyErrorSchema>;
