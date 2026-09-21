import { z } from 'zod';

export const ErrorResponseInputSchema = z.object({
  error: z.unknown()
});

export type ErrorResponseInputDto = z.infer<typeof ErrorResponseInputSchema>;
